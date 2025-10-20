/**
 * Shared utilities for fetching wishlist data
 */

import { wishlist as wishlistAddress } from "@/constants";
import { CACHE_TTL, getWishlistAddressesCacheKey, redis } from "@/lib/redis";
import { thirdwebReadContract } from "@/lib/thirdweb-http-api";

/**
 * Fetch all wishlist addresses from the contract with caching
 * @param chainId - The chain ID to fetch from
 * @returns Array of addresses with wishlists
 */
export async function getWishlistAddresses(chainId: number): Promise<string[]> {
  const cacheKey = getWishlistAddressesCacheKey(chainId);

  // Check cache first
  if (redis) {
    try {
      const cachedAddresses = await redis.get<string[]>(cacheKey);
      if (cachedAddresses) {
        console.log(`[Wishlist] Cache hit for chain ${chainId}`);
        return cachedAddresses;
      }
      console.log(`[Wishlist] Cache miss for chain ${chainId}`);
    } catch (cacheError) {
      console.error("Redis cache read error:", cacheError);
      // Continue to API call if cache fails
    }
  }

  // Fetch from contract using Thirdweb HTTP API
  const response = await thirdwebReadContract(
    [
      {
        contractAddress: wishlistAddress[chainId],
        method: "function getAllWishlistAddresses() view returns (address[])",
        params: [],
      },
    ],
    chainId,
  );

  // Extract data from thirdweb API response (handles both .data and .result formats)
  const rawAddresses = response.result[0].data || response.result[0].result;
  const addresses = Array.isArray(rawAddresses) ? rawAddresses : [];

  console.log(
    `[Wishlist] Fetched ${addresses.length} addresses from contract for chain ${chainId}`,
  );

  // Store in cache for future requests (only if we have valid data)
  if (redis && addresses) {
    try {
      await redis.setex(cacheKey, CACHE_TTL.ONE_HOUR, addresses);
      console.log(
        `[Wishlist] Cached ${addresses.length} addresses for chain ${chainId} (TTL: ${CACHE_TTL.ONE_HOUR}s)`,
      );
    } catch (cacheError) {
      console.error("Redis cache write error:", cacheError);
      // Don't fail the request if cache write fails
    }
  }

  return addresses;
}
