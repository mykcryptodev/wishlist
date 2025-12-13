import {
  getUserSearchCacheKey,
  getWishlistAddressesCacheKey,
  getItemPurchasersCachePrefix,
  redis,
  shouldUseCache,
} from "./redis";

/**
 * Invalidate user search cache by query
 * This should be called if you need to force refresh search results
 * @param query - The search query to invalidate
 * @param cursor - Optional cursor for pagination
 * @param chainId - The chain ID to check if caching should be used
 */
export async function invalidateUserSearchCache(
  query: string,
  cursor?: string,
  chainId?: number,
): Promise<void> {
  // Skip if chain doesn't support caching or redis is not configured
  if (chainId !== undefined && !shouldUseCache(chainId)) return;
  if (!redis) return;

  const cacheKey = getUserSearchCacheKey(query, cursor);
  await redis.del(cacheKey);
}

/**
 * Invalidate all user search caches matching a pattern
 * Warning: This can be expensive if you have many cached searches
 * @param chainId - Optional chain ID to check if caching should be used
 */
export async function invalidateAllUserSearchCaches(
  chainId?: number,
): Promise<void> {
  // Skip if chain doesn't support caching or redis is not configured
  if (chainId !== undefined && !shouldUseCache(chainId)) return;
  if (!redis) return;

  try {
    // Scan for all user-search keys and delete them
    const keys = await redis.keys("user-search:*");
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(
        `[Cache] Invalidated ${keys.length} user search cache entries`,
      );
    }
  } catch (error) {
    console.error("Error invalidating user search caches:", error);
  }
}

/**
 * Invalidate wishlist addresses cache for a specific chain
 * This should be called when a user creates their first wishlist item
 * or when the list of addresses with wishlists changes
 */
export async function invalidateWishlistAddressesCache(
  chainId: number,
): Promise<void> {
  // Skip if chain doesn't support caching
  if (!shouldUseCache(chainId)) {
    console.log(
      `[Cache] Caching disabled for chain ${chainId}, skipping cache invalidation`,
    );
    return;
  }

  if (!redis) {
    console.log("[Cache] Redis not configured, skipping cache invalidation");
    return;
  }

  try {
    const cacheKey = getWishlistAddressesCacheKey(chainId);
    const deleted = await redis.del(cacheKey);
    if (deleted > 0) {
      console.log(
        `[Cache] Invalidated wishlist addresses cache for chain ${chainId}`,
      );
    }
  } catch (error) {
    console.error("Error invalidating wishlist addresses cache:", error);
    // Don't throw - cache invalidation failure shouldn't break the request
  }
}

/**
 * Invalidate all purchaser caches for a given item
 * This should be called when a purchaser signs up or removes themselves
 */
export async function invalidatePurchasersCache(
  chainId: number,
  itemId: number,
): Promise<void> {
  if (!shouldUseCache(chainId)) {
    return;
  }

  if (!redis) {
    return;
  }

  try {
    const prefix = getItemPurchasersCachePrefix(chainId, itemId);
    const keys = await redis.keys(`${prefix}*`);

    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(
        `[Cache] Invalidated ${keys.length} purchaser cache entries for item ${itemId} on chain ${chainId}`,
      );
    }
  } catch (error) {
    console.error("Error invalidating purchasers cache:", error);
  }
}
