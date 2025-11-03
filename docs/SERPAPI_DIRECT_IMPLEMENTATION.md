# Direct SerpAPI Implementation

**Date**: November 3, 2025

## Decision: Use Direct SerpAPI Instead of x402 Proxy

After attempting to use an x402-gated SerpAPI proxy, we've reverted to **direct SerpAPI integration** for the following reasons:

### Why x402 Proxy Didn't Work

1. **Complex Payment Protocol**
   - The x402 proxy requires ERC-3009 `TransferWithAuthorization` (USDC permit-style)
   - We were using regular ERC-20 `transfer()`
   - Incompatible payment methods (like using cash at a credit-card-only terminal)

2. **Implementation Complexity**
   - Multi-step flow: fetch → 402 → pay → poll → wait → retry
   - Required base64 encoding, specific payload structure
   - Complex error handling and debugging
   - 10-15 second latency waiting for transaction confirmation

3. **Not Ready for Production**
   - The thirdweb server-side x402 tooling is still evolving
   - Client-side x402 works great, but server-side requires EIP-712 signatures
   - Would need deeper SDK integration to handle properly

### Why Direct SerpAPI is Better

1. **✅ Simple** - One API call, immediate response
2. **✅ Reliable** - Mature, well-documented API
3. **✅ Fast** - 2-3 second response vs 10-15 seconds
4. **✅ Proven** - Used by thousands of companies
5. **✅ Same Economics** - Still profitable at $0.05/search

## Implementation

### Setup

1. **Get SerpAPI Key**
   - Sign up at https://serpapi.com/
   - Free tier: 100 searches/month
   - Starter plan: $50/month for 5,000 searches

2. **Add to Environment**

   ```bash
   # .env.local
   SERPAPI_KEY=your_api_key_here
   ```

3. **Restart Dev Server**
   ```bash
   bun run dev
   ```

### How It Works

```typescript
// src/lib/price-comparison.ts
export async function searchGoogleShopping(
  productInfo: ProductInfo,
  originalPrice?: number,
): Promise<ComparisonResults> {
  const apiKey = process.env.SERPAPI_KEY;

  const params = new URLSearchParams({
    engine: "google_shopping",
    q: productInfo.searchQuery,
    api_key: apiKey,
    num: "20",
    hl: "en",
    gl: "us",
  });

  const response = await fetch(
    `https://serpapi.com/search?${params.toString()}`,
  );
  const data = await response.json();

  return parseShoppingResults(data, originalPrice);
}
```

### API Endpoint

```typescript
// src/app/api/wishlist/find-cheapest/route.ts

// After user pays $0.05, search Google Shopping
const productInfo = extractProductInfo(item);
const results = await searchGoogleShopping(productInfo, itemPrice);

// Cache for 7 days
await supabaseAdmin.from("price_comparisons").insert({...});

// Return results
return NextResponse.json({ success: true, results });
```

## Economics

### Cost per Search

- **SerpAPI**: $0.01 (on Starter plan)
- **Server compute**: $0.001
- **Total cost**: ~$0.011

### Revenue per Search

- **User pays**: $0.05
- **Cost**: $0.011
- **Profit**: $0.039 (~78% margin)

### Monthly Breakdown

**At 1,000 searches/month:**

- Revenue: $50
- SerpAPI cost: $10
- Compute: $1
- **Profit**: $39 (~78% margin)

**At 5,000 searches/month:**

- Revenue: $250
- SerpAPI cost: $50
- Compute: $5
- **Profit**: $195 (~78% margin)

### Subscription Tiers

| Tier         | Monthly Cost | Searches Included | Cost per Search |
| ------------ | ------------ | ----------------- | --------------- |
| Free         | $0           | 100               | $0              |
| Starter      | $50          | 5,000             | $0.01           |
| Professional | $250         | 30,000            | $0.0083         |

**Recommendation**: Start with free tier for testing, upgrade to Starter when you hit 100 searches.

## Performance

### Response Times

- **First search**: 2-3 seconds
- **Cached search**: <1 second (Supabase cache)
- **SerpAPI latency**: ~1-2 seconds
- **Parsing**: <100ms

### Improvements from Our Optimization

1. **Smart Query Optimization**
   - Removes noise words ("Activated", "Integrated", etc.)
   - Truncates to optimal length
   - Brand extraction

2. **Relevance Scoring**
   - Filters out irrelevant results
   - Prioritizes brand matches
   - Sorts by relevance + price

3. **Aggressive Caching**
   - 7-day cache per user/item
   - Reduces API costs by 30-50%

## Features

### What Works

✅ Real Google Shopping data  
✅ Top 5 cheapest stores  
✅ Product thumbnails  
✅ Store ratings  
✅ Shipping information  
✅ Savings calculations  
✅ 7-day caching  
✅ Better search results with smart optimization

### What's Next

🔄 **Potential Improvements**:

- Affiliate link integration (earn 3-8% commission)
- Price history tracking
- Price drop alerts
- Multi-region support
- Product variant handling

## Testing

### Quick Test

1. Add a wishlist item: "Apple AirPods Pro"
2. Click "Find Cheapest" (if enabled)
3. Pay $0.05
4. See real Google Shopping results

### Expected Results

```json
{
  "cheapestPrice": 229.99,
  "stores": [
    {
      "name": "Amazon",
      "price": 229.99,
      "url": "https://amazon.com/...",
      "savings": 20.0,
      "thumbnail": "https://...",
      "rating": 4.5,
      "shipping": "Free shipping"
    }
  ]
}
```

## Monitoring

### Track These Metrics

1. **API Usage**
   - Monitor at https://serpapi.com/dashboard
   - Set usage alerts at 80% of limit
   - Track costs vs revenue

2. **Search Quality**
   - Relevance rate (% of good matches)
   - User engagement (clicks to stores)
   - Conversion rate (actual purchases)

3. **Cache Performance**
   - Cache hit rate (target: 30%+)
   - Average response time
   - Popular items

## Troubleshooting

### "SERPAPI_KEY environment variable is required"

- Add API key to `.env.local`
- Restart dev server

### "No shopping results found"

- Product not on Google Shopping
- Try more generic search term
- Check SerpAPI dashboard for raw results

### Poor Search Results

- Adjust noise words in `extractProductInfo()`
- Modify relevance threshold
- Check query optimization logic

## Lessons Learned from x402 Attempt

### What We Learned

1. **x402 works great client-side** but server-side is complex
2. **ERC-3009 payments** require EIP-712 signatures, not simple transfers
3. **Sometimes simple is better** - direct API calls vs protocol complexity
4. **Cost isn't everything** - developer time and reliability matter

### When to Use x402

✅ **Good for**:

- Client-side payments
- Wallet-to-wallet transactions
- User-initiated actions
- Experimental features

❌ **Not ideal for**:

- Server-to-server payments (yet)
- High-volume production APIs
- Latency-sensitive operations
- Well-established API integrations

## Related Documentation

- [PRICE_COMPARISON_IMPLEMENTATION.md](./PRICE_COMPARISON_IMPLEMENTATION.md) - Full technical details
- [PRICE_COMPARISON_IMPROVEMENTS.md](./PRICE_COMPARISON_IMPROVEMENTS.md) - Query optimization
- [X402_SERPAPI_INTEGRATION.md](./X402_SERPAPI_INTEGRATION.md) - Archived x402 attempt (for reference)

## Files

### Updated

- `src/lib/price-comparison.ts` - Direct SerpAPI integration
- `src/app/api/wishlist/find-cheapest/route.ts` - Simplified logic
- `env.example` - Added SERPAPI_KEY

### Archived (for reference)

- `docs/X402_SERPAPI_INTEGRATION.md` - The x402 approach we tried
- `X402_SERPAPI_MIGRATION.md` - Migration guide (archived)

---

**Last Updated**: November 3, 2025
