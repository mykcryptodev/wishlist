import { Redis } from "@upstash/redis";
import { baseSepolia } from "thirdweb/chains";

// Check if Redis environment variables are available
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Check if Redis caching should be used for a given chain
 * @param chainId - The chain ID to check
 * @returns true if caching should be used, false otherwise
 */
export const shouldUseCache = (chainId: number): boolean => {
  // Never use cache for baseSepolia
  if (chainId === baseSepolia.id) {
    return false;
  }
  // Only use cache if redis is configured
  return !!redis;
};

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

export const getItemPurchasersCacheKey = (
  chainId: number,
  itemId: number,
  viewerAddress?: string,
) => {
  const viewerKey = viewerAddress ? viewerAddress.toLowerCase() : "anon";
  return `purchasers:${chainId}:${itemId}:viewer:${viewerKey}`;
};

export const getItemPurchasersCachePrefix = (chainId: number, itemId: number) => {
  return `purchasers:${chainId}:${itemId}:viewer:`;
};

export const getMyPurchasesCacheKey = (
  chainId: number,
  userAddress: string,
  offset?: number,
  limit?: number,
) => {
  const baseKey = `my-purchases:${chainId}:${userAddress.toLowerCase()}`;
  if (offset !== undefined && limit !== undefined) {
    return `${baseKey}:o${offset}:l${limit}`;
  }
  return baseKey;
};

export const getFeedCacheKey = (
  chainId: number,
  page: string,
  limit: string,
  includeDetails: boolean,
) => {
  return `feed:${chainId}:p${page}:l${limit}:d${includeDetails}`;
};

export const getSerpApiAvailabilityCacheKey = () => {
  return "serpapi:availability";
};

export const getEthereumPriceCacheKey = () => {
  return "ethereum:price:usd";
};

export const getYouTubeLiveCacheKey = () => {
  return "youtube:live:status";
};

export const getYouTubeLastLiveVideoIdKey = () => {
  return "youtube:live:last-video-id";
};

export const getBurnLeaderboardCacheKey = (limit: number) => {
  return `burn-leaderboard:limit-${limit}`;
};

export const getBurnEventsCacheKey = (staker?: string, limit?: number) => {
  const stakerKey = staker ? staker.toLowerCase() : "all";
  return `burn-events:${stakerKey}:limit-${limit || 50}`;
};

// Cache TTL constants
export const CACHE_TTL = {
  FIVE_SECONDS: 5, // 5 seconds (real-time price data)
  FIFTEEN_SECONDS: 15, // 15 seconds (price data)
  THIRTY_SECONDS: 30, // 30 seconds (price data)
  ONE_MINUTE: 60, // 1 minute in seconds (frequently changing feed data)
  FIVE_MINUTES: 300, // 5 minutes in seconds (user data changes more frequently)
  ONE_HOUR: 3600, // 1 hour in seconds (contract data changes less frequently, SerpAPI availability)
  ONE_DAY: 86400, // 1 day in seconds (Wish Fund recipient data changes rarely)
} as const;
