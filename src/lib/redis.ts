import { Redis } from "@upstash/redis";

import { chain } from "@/constants";

// Check if Redis environment variables are available
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Cache key helpers

export const getUserSearchCacheKey = (query: string, cursor?: string) => {
  const normalizedQuery = query.toLowerCase().trim();
  return cursor
    ? `user-search:${normalizedQuery}:${cursor}`
    : `user-search:${normalizedQuery}`;
};

export const getWishlistAddressesCacheKey = (chainId: number) => {
  return `wishlist-addresses:${chainId}`;
};

// Cache TTL constants
export const CACHE_TTL = {
  FIVE_MINUTES: 300, // 5 minutes in seconds (user data changes more frequently)
  ONE_HOUR: 3600, // 1 hour in seconds (contract data changes less frequently)
} as const;
