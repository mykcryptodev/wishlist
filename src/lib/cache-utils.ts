import { getUserSearchCacheKey, redis } from "./redis";

/**
 * Invalidate user search cache by query
 * This should be called if you need to force refresh search results
 */
export async function invalidateUserSearchCache(
  query: string,
  cursor?: string,
): Promise<void> {
  if (!redis) return;

  const cacheKey = getUserSearchCacheKey(query, cursor);
  await redis.del(cacheKey);
}

/**
 * Invalidate all user search caches matching a pattern
 * Warning: This can be expensive if you have many cached searches
 */
export async function invalidateAllUserSearchCaches(): Promise<void> {
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
