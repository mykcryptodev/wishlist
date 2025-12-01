import { NextRequest, NextResponse } from "next/server";

import { chain } from "@/constants";
import {
  CACHE_TTL,
  getUserSearchCacheKey,
  redis,
  shouldUseCache,
} from "@/lib/redis";
import { getWishlistAddresses } from "@/lib/wishlist-utils";
import { NeynarUser } from "@/types/neynar";

interface UserWithWishlistStatus extends NeynarUser {
  hasWishlist?: boolean;
  wishlistAddress?: string; // The primary verified address that has a wishlist (for backward compatibility)
  wishlistAddresses?: string[]; // All verified addresses that have wishlists
}

interface NeynarSearchResponse {
  result: {
    users: NeynarUser[];
    next?: {
      cursor?: string;
    };
  };
}

// Interface for client.farcaster.xyz response
interface FarcasterClientUserResponse {
  result: {
    user: {
      fid: number;
      username: string;
      displayName: string;
    };
    extras: {
      fid: number;
      custodyAddress: string;
      ethWallets: string[];
      walletLabels?: {
        address: string;
        labels: string[];
      }[];
    };
  };
}

async function getPrimaryWallet(fid: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://client.farcaster.xyz/v2/user?fid=${fid}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data: FarcasterClientUserResponse = await response.json();
    
    // Look for a wallet labeled "primary"
    const primaryWallet = data.result.extras.walletLabels?.find(
      w => w.labels.includes("primary")
    );

    if (primaryWallet) {
      return primaryWallet.address;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching primary wallet for FID ${fid}:`, error);
    return null;
  }
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

    // Check cache first (skip if chain doesn't support caching)
    const cacheKey = getUserSearchCacheKey(query, cursor ?? undefined);
    if (shouldUseCache(chain.id)) {
      try {
        const cachedData = await redis!.get(cacheKey);
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

      // Enhance users with primary wallet data and check wishlist status
      usersWithWishlistStatus = await Promise.all(
        data.result.users.map(async user => {
          // Fetch primary wallet from client.farcaster.xyz
          const primaryWallet = await getPrimaryWallet(user.fid);
          
          // Combine verified addresses with the primary wallet (if found)
          // We prioritize the primary wallet by placing it first if it exists
          let allAddresses = user.verified_addresses?.eth_addresses || [];
          
          if (primaryWallet) {
            // Add primary wallet if not already in the list
            if (!allAddresses.some(addr => addr.toLowerCase() === primaryWallet.toLowerCase())) {
              allAddresses = [primaryWallet, ...allAddresses];
            } else {
              // If it is in the list, move it to the front? 
              // For now, we just ensure it's considered for wishlist checking.
              // Actually, let's make sure we explicitly check the primary wallet first.
            }
          }

          // Find all addresses that have a wishlist
          const userWishlistAddresses = allAddresses.filter(addr =>
            wishlistAddressesSet.has(addr.toLowerCase()),
          );
          
          // If primary wallet has a wishlist, prioritize it as the main wishlistAddress
          let mainWishlistAddress = userWishlistAddresses[0];
          if (primaryWallet && wishlistAddressesSet.has(primaryWallet.toLowerCase())) {
            mainWishlistAddress = primaryWallet;
          }

          return {
            ...user,
            hasWishlist: userWishlistAddresses.length > 0,
            wishlistAddress: mainWishlistAddress, 
            wishlistAddresses: userWishlistAddresses,
          };
        })
      );
    } catch (contractError) {
      console.error("Error checking wishlist status:", contractError);
      // If contract call fails, continue without wishlist status
    }

    const result = {
      users: usersWithWishlistStatus,
      nextCursor: data.result.next?.cursor,
    };

    // Store in cache for future requests (only if chain supports caching)
    if (shouldUseCache(chain.id)) {
      try {
        await redis!.setex(cacheKey, CACHE_TTL.FIVE_MINUTES, result);
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
