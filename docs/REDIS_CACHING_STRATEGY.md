# Redis Caching Strategy for Price Comparison

**Date**: November 3, 2025

## Architecture Decision

We use **Upstash Redis** for caching price comparison results with a **1-hour TTL**, and check SerpAPI availability fresh every time.

### Why This Approach?

**Redis for Search Results** ✅

- Lightning fast (<10ms)
- Native TTL support (auto-expiration)
- Perfect for hot data
- 1-hour freshness is good for prices

**Fresh Availability Checks** ✅

- Accurate quota information
- Prevents edge cases
- Account API is free (doesn't count toward quota)
- Fast enough (~100ms)

## Flow Diagram

```
User Request
  ↓
1. Authenticate ✅
  ↓
2. Check Redis Cache
  ↓
  Cache Hit? ────YES──→ Return results (NO PAYMENT) ✅
  ↓ NO
3. Check SerpAPI Availability (fresh)
  ↓
  Available? ────NO───→ Return 503 (NO PAYMENT) ✅
  ↓ YES
4. Take Payment ($0.05)
  ↓
5. Search Google Shopping
  ↓
6. Cache in Redis (1 hour) ✅
7. Return results
```

## Implementation

### Cache Key Format

```typescript
const cacheKey = `price-comparison:${item.id}:${walletAddress}`;
// Example: "price-comparison:abc123:0x9036..."
```

### Cache Check (Before Payment)

```typescript
// Check Redis first
const cachedResults = await redis.get(cacheKey);

if (cachedResults) {
  console.log("✅ Redis cache hit - returning cached results (no payment)");
  return NextResponse.json({
    success: true,
    results: cachedResults,
    cached: true,
  });
}
```

### Cache Storage (After Search)

```typescript
// Store in Redis with 1-hour TTL
await redis.set(cacheKey, comparisonResults, {
  ex: CACHE_TTL.ONE_HOUR, // 3600 seconds
});

console.log("✅ Cached results in Redis (1 hour TTL)");
```

## Benefits

### 1. Users Never Pay for Cached Results ✅

**Scenario**: User searches for "iPhone 15", then searches again 30 minutes later

**Before** (no caching before payment):

- First search: Pay $0.05 ✅
- Second search: Pay $0.05 ❌ (no cache, pay again)
- **Total**: $0.10 for same data

**After** (1-hour Redis cache, checked before payment):

- First search: Pay $0.05 ✅
- Second search: FREE (Redis cache hit)
- **Total**: $0.05 ✅

### 2. Lightning Fast Cache Hits 🚀

- **Redis**: <10ms
- **Supabase**: 50-100ms
- **5-10x faster** for cached results!

### 3. Fresh Price Data 📊

- 1-hour TTL vs 7-day
- Prices update more frequently
- Better user experience
- Still significant SerpAPI cost savings

### 4. Accurate Quota Tracking ✅

- Always fresh availability check
- Never charge when quota exhausted
- Real-time quota monitoring
- Prevents service outages

## Cost Analysis

### Without Redis Caching

**1,000 searches/month, 30% repeat searches:**

- SerpAPI calls: 1,000
- SerpAPI cost: $10-50
- User revenue: $50
- **Profit**: $0-40

### With Redis Caching (1-hour TTL)

**1,000 searches/month, 30% cache hits:**

- SerpAPI calls: 700 (30% cached)
- SerpAPI cost: $7-35
- User revenue: $35 (only 700 paid searches)
- **Profit**: $0-28

**But**: Users happier (free repeated searches within 1 hour)

### Cache Hit Rate Projections

| Use Pattern          | Cache Hit Rate | SerpAPI Savings |
| -------------------- | -------------- | --------------- |
| Power users browsing | 40-50%         | High            |
| Casual users         | 10-20%         | Low             |
| Gift exchange season | 30-40%         | Medium          |

## Redis Configuration

### Already Configured ✅

Your app already uses Upstash Redis:

```typescript
// src/lib/redis.ts
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const CACHE_TTL = {
  ONE_HOUR: 3600, // Used for price comparisons
};
```

### Environment Variables

```bash
# Already in your .env.local
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

## Key Changes

### src/lib/price-comparison.ts

- ✅ Simplified `checkSerpApiAvailability()` - no more Supabase caching
- ✅ Always checks SerpAPI account fresh

### src/lib/redis.ts

- ✅ Added `getSerpApiAvailabilityCacheKey()` (not used anymore)
- ✅ Documented `ONE_HOUR` TTL usage

### src/app/api/wishlist/find-cheapest/route.ts

- ✅ Check Redis BEFORE taking payment
- ✅ Return cached results without payment
- ✅ Fresh availability check every time
- ✅ Store results in Redis (1-hour TTL)
- ✅ Save to Supabase for analytics (optional)

### supabase-schema.sql

- ✅ Added note that `price_comparisons` is for analytics only
- ✅ Redis is primary cache

## Testing

### Verify Redis Caching Works

1. **First search**:

   ```
   Redis cache miss - will check availability and charge
   ✅ SerpAPI ready (95 searches remaining)
   Payment verified and settled successfully
   ✅ Cached results in Redis (1 hour TTL, 5 stores)
   ```

2. **Second search (within 1 hour)**:

   ```
   ✅ Redis cache hit - returning cached results (no payment)
   ```

3. **Third search (after 1 hour)**:
   ```
   Redis cache miss - will check availability and charge
   (Cache expired, will charge again)
   ```

### Check Redis Directly

```bash
# Using Upstash console or CLI
GET price-comparison:abc123:0x9036...

# Should return:
{
  "cheapestPrice": 229.99,
  "stores": [...],
  "comparedAt": "2025-11-03T..."
}
```

### Check TTL

```bash
TTL price-comparison:abc123:0x9036...
# Should return: ~3600 seconds (or less if time has passed)
```

## Monitoring

### Metrics to Track

1. **Cache Hit Rate**

   ```
   hits / (hits + misses) × 100%
   ```

2. **Cost Savings**

   ```
   SerpAPI calls avoided × $0.01
   ```

3. **User Savings**
   ```
   Cache hits × $0.05 (users didn't pay)
   ```

### Redis Memory Usage

Cache size per entry: ~2-5 KB

- 1,000 cached entries: 2-5 MB
- 10,000 cached entries: 20-50 MB

**Upstash Free Tier**: 256 MB
**Plenty of space!** ✅

## Edge Cases

### Redis Unavailable

```typescript
if (redis) {
  // Use Redis
} else {
  // Gracefully degrade - no caching
  console.warn("Redis not configured, skipping cache");
}
```

### Redis Error

```typescript
try {
  const cached = await redis.get(key);
} catch (error) {
  console.warn("Redis error, continuing:", error);
  // Continue without cache
}
```

### Stale Pricing

- 1-hour TTL means prices can be up to 1 hour old
- Acceptable for most e-commerce scenarios
- Could reduce to 30 minutes if needed

## Comparison: Redis vs Supabase

| Feature     | Redis        | Supabase           | Winner   |
| ----------- | ------------ | ------------------ | -------- |
| Speed       | <10ms        | 50-100ms           | Redis ✅ |
| TTL Support | Native       | Manual cleanup     | Redis ✅ |
| Simplicity  | Key-value    | Tables/indexes/RLS | Redis ✅ |
| Query-able  | No           | Yes                | Supabase |
| Analytics   | No           | Yes                | Supabase |
| Cost        | Free tier OK | Free tier OK       | Tie      |

**Decision**: Redis for caching, Supabase for analytics

## Files Modified

1. **src/lib/redis.ts**
   - Added cache key helper (for documentation)
   - No functional changes (already had Redis setup)

2. **src/lib/price-comparison.ts**
   - Simplified `checkSerpApiAvailability()` (removed Supabase caching)
   - Always checks fresh

3. **src/app/api/wishlist/find-cheapest/route.ts**
   - Check Redis BEFORE payment
   - Return cached results without charging
   - Store in Redis after successful search
   - Keep Supabase saves for analytics

4. **supabase-schema.sql**
   - Added note about Redis being primary cache

## Related Documentation

- [PRICE_COMPARISON_IMPLEMENTATION.md](./PRICE_COMPARISON_IMPLEMENTATION.md) - Main implementation
- [SERPAPI_PREFLIGHT_CHECK.md](./SERPAPI_PREFLIGHT_CHECK.md) - Availability checking
- [REDIS_SETUP.md](./REDIS_SETUP.md) - Redis configuration

---

**Last Updated**: November 3, 2025
