import { NextRequest, NextResponse } from "next/server";

import { chain } from "@/constants";
import { CACHE_TTL, getUserSearchCacheKey, redis } from "@/lib/redis";
import { getWishlistAddresses } from "@/lib/wishlist-utils";

interface NeynarUser {
  object: string;
  fid: number;
  username: string;
  display_name: string;
  custody_address: string;
  pfp_url?: string;
  profile: {
    bio?: {
      text: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses?: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
  power_badge?: boolean;
}

interface UserWithWishlistStatus extends NeynarUser {
  hasWishlist?: boolean;
  wishlistAddress?: string; // The specific verified address that has a wishlist
}

interface NeynarSearchResponse {
  result: {
    users: NeynarUser[];
    next?: {
      cursor?: string;
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limitParam = searchParams.get("limit");
    // Neynar API only accepts limit between 1 and 10
    const limit = limitParam
      ? Math.min(Math.max(parseInt(limitParam, 10), 1), 10).toString()
      : "10";
    const cursor = searchParams.get("cursor");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 },
      );
    }

    // Check cache first
    const cacheKey = getUserSearchCacheKey(query, cursor ?? undefined);
    if (redis) {
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log(`[User Search] Cache hit for query: "${query}"`);
          return NextResponse.json(cachedData);
        }
        console.log(`[User Search] Cache miss for query: "${query}"`);
      } catch (cacheError) {
        console.error("Redis cache read error:", cacheError);
        // Continue to API call if cache fails
      }
    }

    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      console.error("NEYNAR_API_KEY is not configured");
      return NextResponse.json(
        { error: "Neynar API key is not configured" },
        { status: 500 },
      );
    }

    // Build the URL with query parameters
    const url = new URL("https://api.neynar.com/v2/farcaster/user/search");
    url.searchParams.append("q", query);
    url.searchParams.append("limit", limit);
    if (cursor) {
      url.searchParams.append("cursor", cursor);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Neynar API error: ${response.status} ${response.statusText}`,
        errorText,
      );
      return NextResponse.json(
        {
          error: "Failed to search users",
          details: errorText,
        },
        { status: response.status },
      );
    }

    const data: NeynarSearchResponse = await response.json();

    // Check wishlist status for users with verified addresses
    let usersWithWishlistStatus: UserWithWishlistStatus[] = data.result.users;

    try {
      // Get all addresses with wishlists from the contract (with caching)
      const addressesWithWishlists = await getWishlistAddresses(chain.id);

      // Convert to lowercase for case-insensitive comparison
      const wishlistAddressesSet = new Set(
        addressesWithWishlists.map(addr => addr.toLowerCase()),
      );

      // Check each user's verified addresses against the wishlist
      usersWithWishlistStatus = data.result.users.map(user => {
        // Find the specific address that has a wishlist (if any)
        const userWishlistAddress =
          user.verified_addresses?.eth_addresses?.find(addr =>
            wishlistAddressesSet.has(addr.toLowerCase()),
          );

        return {
          ...user,
          hasWishlist: !!userWishlistAddress,
          wishlistAddress: userWishlistAddress,
        };
      });
    } catch (contractError) {
      console.error("Error checking wishlist status:", contractError);
      // If contract call fails, continue without wishlist status
    }

    const result = {
      users: usersWithWishlistStatus,
      nextCursor: data.result.next?.cursor,
    };

    // Store in cache for future requests
    if (redis) {
      try {
        await redis.setex(cacheKey, CACHE_TTL.FIVE_MINUTES, result);
        console.log(
          `[User Search] Cached results for query: "${query}" (TTL: ${CACHE_TTL.FIVE_MINUTES}s)`,
        );
      } catch (cacheError) {
        console.error("Redis cache write error:", cacheError);
        // Don't fail the request if cache write fails
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
