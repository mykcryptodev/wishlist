# Price Comparison Implementation

This document describes the implementation of the real-time price comparison feature that uses Google Shopping to find the cheapest prices for wishlist items.

## Overview

The price comparison feature allows users to pay a small fee ($0.05 in crypto) to search Google Shopping for the best prices on their wishlist items. The implementation uses **direct SerpAPI integration** to access Google Shopping results and returns **all relevant results** (typically 8-20 stores) sorted by price.

**Implementation Choice**: We use direct SerpAPI (not x402 proxy) for simplicity, reliability, and faster response times. See [SERPAPI_DIRECT_IMPLEMENTATION.md](./SERPAPI_DIRECT_IMPLEMENTATION.md) for rationale.

## Architecture

### Components

1. **API Endpoint**: `/api/wishlist/find-cheapest`
   - x402-gated endpoint requiring payment
   - Handles authentication, payment verification, and price searching
   - Caches results for 7 days per user/item combination

2. **Price Comparison Library**: `src/lib/price-comparison.ts`
   - Product info extraction
   - Google Shopping search via SerpAPI
   - Result parsing and formatting

3. **Frontend**: `FindCheapestButton` component
   - Handles x402 payment flow
   - Displays results in a modal

## How It Works

### 1. Product Extraction

When a user clicks "Find Cheapest", we extract product information:

```typescript
const productInfo = extractProductInfo({
  title: item.title,
  url: item.url,
  description: item.description,
});
```

This function:

- Cleans up the title (removes brackets, parentheses)
- Attempts to extract brand information
- Creates an optimized search query
- Truncates long queries to 100 characters

### 2. Google Shopping Search

We use SerpAPI to search Google Shopping:

```typescript
const results = await searchGoogleShopping(productInfo, itemPrice);
```

The search:

- Queries Google Shopping with the optimized search term
- Retrieves up to 20 results
- Parses prices from various formats
- Filters out invalid results

### 3. Result Processing

Results are:

- Filtered for relevance (>20% keyword match)
- Sorted by price (cheapest first)
- All relevant stores returned (no limit)
- Enhanced with savings calculations
- Cached in Redis for 1 hour

### 4. Response Format

```json
{
  "success": true,
  "cached": false,
  "results": {
    "cheapestPrice": 85.99,
    "stores": [
      {
        "name": "Amazon",
        "price": 85.99,
        "url": "https://amazon.com/...",
        "savings": 14.01,
        "source": "Amazon",
        "thumbnail": "https://...",
        "shipping": "Free shipping",
        "rating": 4.5
      }
    ],
    "comparedAt": "2025-11-03T..."
  }
}
```

## Setup Instructions

### 1. Configure Server Wallet (Required)

**No SerpAPI subscription needed!** We use an x402-gated proxy instead.

Your server wallet needs:

1. **USDC on Base** (~$1 for 100 searches, $10+ recommended)
2. **Small amount of ETH on Base** for gas fees (0.001 ETH minimum)

Check your balance:

```bash
# View on BaseScan
https://basescan.org/address/YOUR_SERVER_WALLET
```

**Cost per search**: $0.01 USDC (paid automatically via x402)

See [X402_SERPAPI_INTEGRATION.md](./X402_SERPAPI_INTEGRATION.md) for detailed information.

### 2. Configure Next.js for External Images

The `next.config.ts` has been updated to allow Google Shopping product images:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**.gstatic.com",
      pathname: "/shopping/**",
    },
    {
      protocol: "https",
      hostname: "**.googleusercontent.com",
    },
  ],
}
```

**Important**: You must restart your dev server after any `next.config.ts` changes.

### 3. Test the Implementation

The feature is currently hidden in the UI (see `FindCheapestButton.tsx` line 98). To enable it for testing:

```typescript
// Remove the 'hidden' class
<Button
  className="w-full" // Remove "hidden"
  disabled={isLoading}
  size={size}
  variant={variant}
  onClick={handleClick}
>
```

## Cost Analysis

### Per-Request Costs

- **x402 SerpAPI Proxy**: $0.01 USDC per search (paid via x402)
- **Gas fees**: ~$0.0001 per transaction
- **Server compute**: ~$0.001
- **Total cost**: ~$0.0111 per request

### Revenue Model

- **User pays**: $0.05 per search (in WISH or USDC)
- **Cost**: $0.0111 per search
- **Profit**: $0.0389 per search (~78% margin)

### Monthly Analysis (1,000 searches)

- Revenue: $50 (1,000 × $0.05)
- Costs: $11.11 (1,000 × $0.0111)
- **Profit**: $38.89 (~78% margin)

### No Subscription Required!

Unlike direct SerpAPI ($50/month minimum), the x402 proxy is **pay-per-use**:

- $0 when not used
- $0.01 per search when used
- No commitment or minimum fees

**Advantage**: Perfect for low/variable volume. Only pay for successful searches.

## Caching Strategy

Results are cached in Supabase for **7 days** to:

- Reduce API costs for popular items
- Improve response times
- Provide value to repeat users

Cache key: `(item_id, wallet_address)`

## Error Handling

The implementation handles several error cases:

1. **Missing API Key**: Returns 500 with clear error message
2. **No Results Found**: Returns 500 with descriptive error
3. **Invalid Prices**: Filters out and continues with valid results
4. **Cache Failures**: Logs error but continues serving results
5. **Payment Failures**: Returns appropriate x402 status codes

## Alternative Implementations

The current implementation uses an x402-gated SerpAPI proxy. Other options:

### Option A: Thirdweb AI Chat

Use Thirdweb's AI chat API (you're already paying for Thirdweb):

```typescript
const response = await fetch("https://api.thirdweb.com/v1/ai/chat", {
  method: "POST",
  headers: { "x-secret-key": THIRDWEB_SECRET_KEY },
  body: JSON.stringify({
    messages: [
      {
        role: "user",
        content: `Find cheapest prices for: ${item.title}`,
      },
    ],
  }),
});
```

### Option B: Direct Google Shopping API

Use Google's official API (requires Google Cloud setup):

- More complex setup
- Lower cost (~$0.005/search)
- More control over queries

### Option C: Affiliate Model

Don't charge users; make money via affiliate commissions:

- Amazon Associates (3-8% commission)
- Walmart Affiliates (4% commission)
- Makes $4-8 per $100 purchase instead of $0.05 per search

## Future Improvements

1. **Affiliate Integration**: Add affiliate tracking IDs to URLs
2. **Price History**: Track prices over time
3. **Price Alerts**: Notify users when prices drop
4. **Better Matching**: Use ML to match product variations
5. **Multiple Sources**: Add eBay, Walmart API, etc.
6. **Smart Caching**: Cache by product hash, not item_id

## Testing

### Manual Testing

1. Add a wishlist item with a common product
2. Click "Find Cheapest" button
3. Approve the x402 payment ($0.05)
4. Verify results show real Google Shopping data
5. Click again to verify caching works

### Monitoring

Check logs for:

- SerpAPI request/response
- Product info extraction
- Number of results found
- Cache hit/miss ratio

## Troubleshooting

### "Insufficient USDC balance" or "x402 payment failed"

- Check your server wallet has USDC on Base
- View balance at: `https://basescan.org/address/YOUR_SERVER_WALLET`
- Minimum: $1 USDC recommended
- Top up if needed

### "No shopping results found for this product"

- The product may not be on Google Shopping
- Try with a more generic or common product name
- Check logs for the actual search query used

### Prices look wrong

- Check that `extracted_price` field is being parsed correctly
- Some stores use different currency formats
- Verify the `parseShoppingResults` function

## Related Documentation

- [PRICE_COMPARISON_FEATURE.md](./PRICE_COMPARISON_FEATURE.md) - Original feature planning
- [X402_PAYMENTS.md](./X402_PAYMENTS.md) - x402 payment system
- [REDIS_SETUP.md](./REDIS_SETUP.md) - Caching setup

---

**Last Updated**: November 3, 2025
