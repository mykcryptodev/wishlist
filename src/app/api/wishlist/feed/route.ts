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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const includeDetails = searchParams.get("includeDetails") !== "false"; // Default to true

    // Check Redis cache first
    const useCache = shouldUseCache(chain.id);
    const cacheKey = getFeedCacheKey(
      chain.id,
      page.toString(),
      limit.toString(),
      includeDetails,
    );

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

    // 1. Get total items count from contract
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
      } else {
        throw new Error("Failed to fetch total items count");
      }
    } catch (error) {
      console.error("Failed to fetch total items:", error);
      throw error;
    }

    // 2. Calculate ID range for pagination (Descending order: newest first)
    // IDs are assumed to be 1-based and sequential up to totalItems
    const startId = totalItems - (page - 1) * limit;
    const endId = Math.max(1, startId - limit + 1);

    if (startId < 1) {
      return NextResponse.json({
        success: true,
        items: [],
        pagination: {
          page,
          limit,
          hasMore: false,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      });
    }

    const idsToFetch: number[] = [];
    for (let i = startId; i >= endId; i--) {
      idsToFetch.push(i);
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `Fetching items for page ${page}: IDs ${startId} to ${endId} (Total: ${totalItems})`,
      );
    }

    // 3. Batch fetch item details
    const itemDetailsCalls = idsToFetch.map(id => ({
      contractAddress: wishlist[chain.id],
      method:
        "function items(uint256) external view returns (uint256 id, address owner, string title, string description, string url, string imageUrl, uint256 price, bool exists, uint256 createdAt, uint256 updatedAt)",
      params: [id],
    }));

    const itemDetailsResult = await thirdwebReadContract(
      itemDetailsCalls,
      chain.id,
    );

    // 4. Map to response format
    const feedItems = itemDetailsResult.result
      .map((result, index) => {
        if (!result.success || (!result.data && !result.result)) return null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (result.data || result.result) as any;
        
        // Handle array-like return from Thirdweb
        const id = (data[0] || idsToFetch[index]).toString();
        const owner = data[1] as string;
        const title = data[2] as string;
        const description = data[3] as string;
        const url = data[4] as string;
        const imageUrl = data[5] as string;
        const price = (data[6] || "0").toString();
        const exists = data[7] as boolean;
        const createdAt = (data[8] || Date.now() / 1000).toString();
        // const updatedAt = data[9];

        if (!exists) return null;

        return {
          itemId: id,
          owner,
          title,
          url,
          description,
          imageUrl,
          price,
          blockNumber: "0", // Not available from state read
          blockTimestamp: createdAt,
          transactionHash: `item-${id}`, // Placeholder
        };
      })
      .filter(item => item !== null);

    const totalPages = Math.ceil(totalItems / limit);
    const hasMore = page < totalPages;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `📄 Pagination: Page ${page}/${totalPages > 0 ? totalPages : "?"}, hasMore: ${hasMore}`,
      );
    }

    const feedResponse = {
      success: true,
      items: feedItems,
      pagination: {
        page,
        limit,
        hasMore,
        totalItems,
        totalPages,
      },
    };

    // Cache the response in Redis
    if (useCache && redis && feedItems.length > 0) {
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
