# SerpAPI Pre-Flight Check

**Date**: November 3, 2025

## Problem Solved

**Without pre-flight check** ❌:

1. User pays $0.05
2. We try to call SerpAPI
3. SerpAPI quota exhausted → 429 error
4. User charged but gets nothing!

**With pre-flight check** ✅:

1. Check SerpAPI quota FIRST (free check)
2. If unavailable → Return 503, NO payment triggered
3. If available → Proceed with payment
4. User only pays when we can deliver

## Implementation

### Pre-Flight Check (Before Payment)

```typescript
// Step 1: Check SerpAPI availability BEFORE taking user's money
const serpApiStatus = await checkSerpApiAvailability();

if (!serpApiStatus.available) {
  // Return 503 Service Unavailable - this does NOT trigger payment
  return NextResponse.json({
    error: "Price comparison service temporarily unavailable",
    details: serpApiStatus.reason,
  }, { status: 503 });
}

// Step 2: NOW proceed with x402 payment (we know we can deliver)
const verificationResult = await settlePayment({...});
```

### What Gets Checked

According to [SerpAPI Account API docs](https://serpapi.com/account-api):

```typescript
{
  "total_searches_left": 5958,           // ← Monthly quota remaining
  "last_hour_searches": 42,              // ← Recent usage
  "account_rate_limit_per_hour": 6000,   // ← Hourly limit
  "plan_name": "Big Data Plan",
  "plan_searches_left": 5958
}
```

### Checks Performed

1. **API Key Valid** ✅
   - Verifies SERPAPI_KEY is configured
   - Tests if key authenticates successfully

2. **Quota Available** ✅
   - `total_searches_left > 0`
   - Includes extra credits
   - Monthly + rollover searches

3. **Rate Limit** ✅
   - Checks if within hourly limit
   - 90% threshold for safety buffer
   - Prevents hitting hard limit

### Response Codes

| Status | Meaning                     | Payment Triggered?                       |
| ------ | --------------------------- | ---------------------------------------- |
| 200    | Success - results returned  | ✅ Yes (user got value)                  |
| 402    | Payment required            | ❌ No (waiting for payment)              |
| 500    | Search failed after payment | ✅ Yes (but cached to prevent re-charge) |
| 503    | Service unavailable         | ❌ No (pre-flight failed)                |

## Benefits

### Protects Users ✅

- Never charge when we can't deliver
- Clear error messages about why service is unavailable
- Preserves trust and user experience

### Protects You ✅

- Avoids angry users demanding refunds
- Clear visibility of quota status
- Early warning when quota is low

### Cost-Free Check ✅

According to SerpAPI: ["Account API is free of charge, and using it will not be counted toward your monthly quota"](https://serpapi.com/account-api)

So checking availability costs **$0**! 🎉

## Monitoring

### Logs to Watch

```
Pre-flight: Checking SerpAPI availability...
✅ SerpAPI available: {
  searchesLeft: 95,
  plan: 'Free',
  hourlyUsage: '3/60'
}
```

### Warning Signs

**Low quota**:

```
✅ SerpAPI available: {
  searchesLeft: 5,  ← Only 5 searches left!
  plan: 'Free'
}
```

**Rate limited**:

```
❌ SerpAPI not available: SerpAPI hourly rate limit nearly reached. Try again later.
```

**Quota exhausted**:

```
❌ SerpAPI not available: SerpAPI quota exhausted. No searches remaining this month.
```

## User Experience

### When Service Available

1. User clicks "Find Cheapest"
2. Pre-flight check passes instantly (<100ms)
3. Payment prompt shows ($0.05)
4. User pays
5. Search executes
6. Results displayed

**Total time**: 3-5 seconds

### When Service Unavailable

1. User clicks "Find Cheapest"
2. Pre-flight check fails (<100ms)
3. Error toast shown immediately
4. **No payment prompt** ✅
5. User keeps their money

**Error message**:

```
"Price comparison service temporarily unavailable"
Details: "SerpAPI quota exhausted. No searches remaining this month."
```

## Recommended Monitoring

### Set Up Alerts

Add monitoring to warn you when quota is low:

```typescript
const serpApiStatus = await checkSerpApiAvailability();

if (serpApiStatus.searchesLeft && serpApiStatus.searchesLeft < 100) {
  // Send alert email/Slack notification
  console.warn(
    `⚠️ SerpAPI quota low: ${serpApiStatus.searchesLeft} searches left`,
  );
}
```

### Dashboard Widget

Show in admin panel:

- Searches remaining
- Hourly usage
- Plan name
- Projected month-end usage

## Error Handling

### Invalid API Key

```typescript
{
  available: false,
  reason: "SerpAPI account check failed: 401"
}
```

**Action**: Check SERPAPI_KEY in `.env.local`

### Network Error

```typescript
{
  available: false,
  reason: "Failed to verify SerpAPI account status"
}
```

**Action**: Temporary - retry in a moment

### Quota Exhausted

```typescript
{
  available: false,
  reason: "SerpAPI quota exhausted. No searches remaining this month.",
  searchesLeft: 0
}
```

**Action**:

- Upgrade SerpAPI plan
- Wait for monthly reset
- Add extra credits

## Testing

### Test Pre-Flight Failure

Temporarily set invalid API key:

```bash
# .env.local
SERPAPI_KEY=invalid_key_for_testing
```

Expected:

- ❌ Pre-flight fails
- ❌ No payment prompt
- ✅ User keeps money

### Test Quota Warning

When you have <10 searches left, you should see:

```
✅ SerpAPI available: {
  searchesLeft: 8,  ← Getting low!
  plan: 'Free'
}
```

## Cost Analysis

### Account API Calls

- **Free**: ✅ Doesn't count toward quota
- **Fast**: ~50-100ms response time
- **Frequency**: 1 per user search request
- **Cached**: Could cache for 1 minute if needed

### Example Usage

1,000 user searches/month:

- Account API calls: 1,000 (free)
- Shopping API calls: 1,000 (costs $10-50)
- **Pre-flight overhead**: $0

## Files Modified

1. **src/lib/price-comparison.ts**
   - Added `checkSerpApiAvailability()` function
   - Checks quota, rate limits, API key validity

2. **src/app/api/wishlist/find-cheapest/route.ts**
   - Added pre-flight check before payment
   - Returns 503 if service unavailable
   - Logs quota status

## Future Improvements

### Auto-Scale Pricing

```typescript
// If quota low, increase price to slow demand
if (searchesLeft < 100) {
  TARGET_PRICE_USD = 0.1; // Double price when quota low
}
```

### Graceful Degradation

```typescript
// If SerpAPI unavailable, offer alternative
if (!serpApiStatus.available) {
  return {
    error: "SerpAPI unavailable",
    alternative: "Try searching on Google Shopping directly",
    link: `https://www.google.com/search?tbm=shop&q=${item.title}`,
  };
}
```

### Smart Retry

```typescript
// If rate limited, tell user when to retry
if (reason.includes("rate limit")) {
  return {
    error: "Too many requests",
    retryAfter: 60, // seconds
    message: "Try again in 1 minute",
  };
}
```

## Related Documentation

- [PRICE_COMPARISON_IMPLEMENTATION.md](./PRICE_COMPARISON_IMPLEMENTATION.md) - Main implementation
- [SERPAPI_DIRECT_IMPLEMENTATION.md](./SERPAPI_DIRECT_IMPLEMENTATION.md) - Why we use direct SerpAPI
- [SerpAPI Account API](https://serpapi.com/account-api) - Official documentation

---

**Last Updated**: November 3, 2025
