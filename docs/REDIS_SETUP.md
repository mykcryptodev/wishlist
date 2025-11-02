# Redis Caching Setup

This project uses Upstash Redis for caching data to reduce API calls and improve performance.

## Setup

1. **Create an Upstash Redis database**:
   - Go to [Upstash Console](https://console.upstash.com/)
   - Create a new Redis database
   - Copy the REST URL and REST Token

2. **Configure environment variables**:

   ```bash
   # Add to your .env.local file
   UPSTASH_REDIS_REST_URL=your_redis_url_here
   UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
   ```

3. **Test the setup**:
   - The API will work without Redis (falls back to direct API/blockchain calls)
   - With Redis configured, data will be cached according to the TTL settings
   - Check console logs to see cache hits/misses

## Features

- **User Search Caching**: Neynar user search results are cached for 5 minutes
- **Feed Caching**: Wishlist feed data is cached for 1 minute
- **Wishlist Addresses Caching**: Contract address lists are cached for 1 hour
- **Automatic Fallback**: If Redis is not configured, the API falls back to direct calls
- **Chain-Specific**: Caching is disabled for Base Sepolia testnet to ensure fresh data during development
- **Performance**: Reduces external API calls and improves response times

## Cache Keys

All cache keys are defined in `src/lib/redis.ts`:

- User search: `user-search:{query}` or `user-search:{query}:{cursor}` for paginated results
  - Example: `user-search:alice` (search for "alice")
  - Example: `user-search:bob:cursor123` (paginated search)
- Wishlist addresses: `wishlist-addresses:{chainId}`
  - Example: `wishlist-addresses:8453` (Base mainnet)
- Feed data: `feed:{chainId}:p{page}:l{limit}:d{includeDetails}`
  - Example: `feed:8453:p1:l20:dtrue` (first page with details)

## Cache TTL Settings

Defined in `src/lib/redis.ts`:

- **ONE_MINUTE**: 60 seconds - Used for frequently changing feed data
- **FIVE_MINUTES**: 300 seconds - Used for user search data
- **ONE_HOUR**: 3600 seconds - Used for contract address lists that change infrequently

## Cache Helper Functions

Located in `src/lib/redis.ts`:

- `shouldUseCache(chainId)` - Returns whether caching should be used for the given chain
- `getUserSearchCacheKey(query, cursor?)` - Generate cache key for user search
- `getWishlistAddressesCacheKey(chainId)` - Generate cache key for wishlist addresses
- `getFeedCacheKey(chainId, page, limit, includeDetails)` - Generate cache key for feed data

## Usage in API Routes

Example from user search API:

```typescript
const cacheKey = getUserSearchCacheKey(query, cursor ?? undefined);
if (shouldUseCache(chain.id)) {
  const cachedData = await redis!.get(cacheKey);
  if (cachedData) {
    return NextResponse.json(cachedData);
  }
}
// ... fetch from Neynar API ...
await redis!.setex(cacheKey, CACHE_TTL.FIVE_MINUTES, result);
```

## Benefits

- **Reduced API Costs**: Fewer calls to Neynar API and Thirdweb API
- **Better Performance**: Instant responses for cached data
- **Lower Rate Limits**: Reduced risk of hitting API rate limits
- **Improved UX**: Faster page loads and search results

## Monitoring

- Check console logs for cache hits/misses in development
- Look for log messages like:
  - `[User Search] Cache hit for query: "alice"`
  - `💾 Cache HIT for feed:8453:p1:l20:dtrue`
  - `🔍 Cache MISS for feed:8453:p1:l20:dtrue`

## Future Enhancements

- Add cache warming for popular queries
- Implement cache invalidation webhooks
- Add Redis monitoring dashboard
- Track cache hit rates and performance metrics
