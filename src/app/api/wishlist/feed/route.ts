import { NextRequest, NextResponse } from "next/server";

import { chain, wishlist } from "@/constants";
import { CACHE_TTL, getFeedCacheKey, redis, shouldUseCache } from "@/lib/redis";
import { thirdwebReadContract } from "@/lib/thirdweb-http-api";

const THIRDWEB_API_URL = "https://api.thirdweb.com/v1";
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY!;

interface EventLog {
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
  topics: string[];
  data: string;
  decoded?: {
    eventName: string;
    params: Array<{
      name: string;
      type: string;
      value: string;
    }>;
  };
}

// Thirdweb API response structure (flexible to handle different formats)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ThirdwebEventsResponse {
  result?:
    | {
        events?: EventLog[];
        page?: {
          hasNextPage?: boolean;
          hasPreviousPage?: boolean;
        };
      }
    | EventLog[];
}

/**
 * Get latest wishlist items feed endpoint
 *
 * GET /api/wishlist/feed?page=1&limit=20&includeDetails=true
 *
 * Fetches the latest ItemCreated events from the Wishlist contract
 *
 * @query page - Page number (optional, default: 1)
 * @query limit - Items per page (optional, default: 20, max: 100)
 * @query includeDetails - Whether to fetch full item details (optional, default: true)
 *
 * @returns Array of recent wishlist items with creator info
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20"),
      100,
    ).toString();
    const includeDetails = searchParams.get("includeDetails") !== "false"; // Default to true

    // Check Redis cache first
    const useCache = shouldUseCache(chain.id);
    const cacheKey = getFeedCacheKey(chain.id, page, limit, includeDetails);

    if (useCache && redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          if (process.env.NODE_ENV === "development") {
            console.log(`💾 Cache HIT for ${cacheKey}`);
          }
          return NextResponse.json(cached);
        }
        if (process.env.NODE_ENV === "development") {
          console.log(`🔍 Cache MISS for ${cacheKey}`);
        }
      } catch (error) {
        console.error("Redis cache read error:", error);
        // Continue without cache
      }
    }

    // ItemCreated event signature: ItemCreated(uint256 indexed itemId, address indexed owner, string title, string url)
    // Keccak256 hash from the actual Wishlist contract
    // This is the hash we see in the logs: 0x492ed020ceefbf98fa397c98e691a930417875a66e7b5f6014018d970f13abef
    const itemCreatedSignature =
      "0x492ed020ceefbf98fa397c98e691a930417875a66e7b5f6014018d970f13abef";

    // Get total items count from contract for better pagination
    let totalItems = 0;
    try {
      const totalItemsResult = await thirdwebReadContract(
        [
          {
            contractAddress: wishlist[chain.id],
            method: "function getTotalItems() external view returns (uint256)",
            params: [],
          },
        ],
        chain.id,
      );

      if (totalItemsResult.result[0]?.success) {
        const data =
          totalItemsResult.result[0].data || totalItemsResult.result[0].result;
        totalItems = parseInt(data as string);

        if (process.env.NODE_ENV === "development") {
          console.log(`📊 Total items in contract: ${totalItems}`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch total items:", error);
      // Continue without total count
    }

    // Fetch events from the Wishlist contract
    const response = await fetch(
      `${THIRDWEB_API_URL}/contracts/${chain.id}/${wishlist[chain.id]}/events?page=${page}&limit=${limit}&sortOrder=desc`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-secret-key": THIRDWEB_SECRET_KEY,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Thirdweb API error: ${response.status} - ${errorText}`);
    }

    const eventsData = await response.json();

    // Log basic response info (can be removed in production)
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Fetched ${eventsData.result?.events?.length || 0} events from contract`,
      );
    }

    // Handle different possible response structures
    let events: EventLog[] = [];
    if (eventsData.result?.events) {
      events = eventsData.result.events;
    } else if (Array.isArray(eventsData.result)) {
      events = eventsData.result;
    } else if (Array.isArray(eventsData)) {
      events = eventsData;
    } else {
      console.error("Unexpected API response structure:", eventsData);
      // Return empty result instead of throwing
      return NextResponse.json({
        success: true,
        items: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: false,
        },
      });
    }

    // Filter for ItemCreated events using the actual topic signature
    const itemCreatedEvents = events.filter(event => {
      // Check the topic signature (this is the most reliable method)
      if (event.topics && event.topics[0] === itemCreatedSignature) return true;

      // Fallback: Check decoded event name (if Thirdweb provides it)
      if (event.decoded?.eventName === "ItemCreated") return true;

      return false;
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`✨ Found ${itemCreatedEvents.length} ItemCreated events`);
    }

    // Transform events into a more usable format
    const feedItems = itemCreatedEvents.map(event => {
      let itemId = "";
      let owner = "";
      let title = "";
      let url = "";

      // Try to extract data from decoded params
      if (event.decoded?.params) {
        // Handle params as an array
        if (Array.isArray(event.decoded.params)) {
          itemId =
            event.decoded.params.find(
              (p: { name: string; value: string }) => p.name === "itemId",
            )?.value || "";
          owner =
            event.decoded.params.find(
              (p: { name: string; value: string }) => p.name === "owner",
            )?.value || "";
          title =
            event.decoded.params.find(
              (p: { name: string; value: string }) => p.name === "title",
            )?.value || "";
          url =
            event.decoded.params.find(
              (p: { name: string; value: string }) => p.name === "url",
            )?.value || "";
        }
        // Handle params as an object
        else if (typeof event.decoded.params === "object") {
          const params = event.decoded.params as Record<
            string,
            string | number
          >;
          itemId = (params.itemId || params[0] || "").toString();
          owner = (params.owner || params[1] || "").toString();
          title = (params.title || params[2] || "").toString();
          url = (params.url || params[3] || "").toString();
        }
      }

      // Fallback to extracting from topics if we didn't get data from decoded
      if (!itemId && event.topics[1]) {
        // Topics are indexed parameters (itemId and owner)
        itemId = BigInt(event.topics[1]).toString();
      }
      if (!owner && event.topics[2]) {
        // Owner is the second indexed param - remove padding to get address
        owner = "0x" + event.topics[2].slice(-40);
      }

      return {
        itemId,
        owner,
        title,
        url,
        description: "",
        imageUrl: "",
        price: "0",
        blockNumber: event.blockNumber,
        blockTimestamp: event.blockTimestamp,
        transactionHash: event.transactionHash,
      };
    });

    // Optionally fetch full item details from the contract
    let enrichedFeedItems = feedItems;
    if (includeDetails && feedItems.length > 0) {
      try {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `📦 Enriching ${feedItems.length} items with full details...`,
          );
        }

        // Batch read all item details
        const itemDetailsCalls = feedItems.map(item => ({
          contractAddress: wishlist[chain.id],
          method:
            "function items(uint256) external view returns (uint256 id, address owner, string title, string description, string url, string imageUrl, uint256 price, bool exists, uint256 createdAt, uint256 updatedAt)",
          params: [item.itemId],
        }));

        const itemDetailsResult = await thirdwebReadContract(
          itemDetailsCalls,
          chain.id,
        );

        // Enrich feed items with full details
        enrichedFeedItems = feedItems.map((item, index) => {
          const details = itemDetailsResult.result[index];
          if (details.success && (details.data || details.result)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = (details.data || details.result) as any;
            return {
              ...item,
              description: (data[3] as string) || item.description,
              imageUrl: (data[5] as string) || item.imageUrl,
              price: (data[6] as string) || item.price,
            };
          }
          return item;
        });

        if (process.env.NODE_ENV === "development") {
          console.log(
            `✅ Successfully enriched ${enrichedFeedItems.length} items`,
          );
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
        // Continue with basic items if detail fetch fails
      }
    }

    // Determine pagination info based on total items from contract
    let hasMore = false;
    let totalPages = 0;

    if (totalItems > 0) {
      // Calculate total pages based on contract's total item count
      totalPages = Math.ceil(totalItems / parseInt(limit));
      // Check if there are more pages after the current one
      hasMore = parseInt(page) < totalPages;
    } else {
      // Fallback: use Thirdweb's pagination if we don't have total count
      if (eventsData.result?.page?.hasNextPage !== undefined) {
        hasMore = eventsData.result.page.hasNextPage;
      } else {
        // Last resort: assume more if we got a full page of ItemCreated events
        hasMore = itemCreatedEvents.length >= parseInt(limit);
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `📄 Pagination: Page ${page}/${totalPages > 0 ? totalPages : "?"}, hasMore: ${hasMore}`,
      );
    }

    const feedResponse = {
      success: true,
      items: enrichedFeedItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore,
        totalItems,
        totalPages,
      },
    };

    // Cache the response in Redis
    if (useCache && redis) {
      try {
        await redis.setex(
          cacheKey,
          CACHE_TTL.ONE_MINUTE,
          JSON.stringify(feedResponse),
        );
        if (process.env.NODE_ENV === "development") {
          console.log(`💾 Cached response for ${cacheKey} (TTL: 60s)`);
        }
      } catch (error) {
        console.error("Redis cache write error:", error);
        // Continue without caching
      }
    }

    return NextResponse.json(feedResponse);
  } catch (error) {
    console.error("Error fetching wishlist feed:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch wishlist feed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
