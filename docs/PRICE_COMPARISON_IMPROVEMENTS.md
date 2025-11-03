# Price Comparison Improvements

**Date**: November 3, 2025

## Issues Fixed

### 1. ❌ Massive Savings Bug ($35 Quintillion)

**Problem**: The item price was stored in blockchain wei format (e.g., `35000000000000000000`), causing absurd savings calculations.

**Solution**: Added price validation in the API endpoint:

```typescript
// Parse item price - handle both regular prices and blockchain wei format
let itemPrice: number | undefined;
if (item.price) {
  const parsed = parseFloat(item.price);
  // If price is unreasonably large (likely wei format), ignore it
  if (parsed > 0 && parsed < 1000000) {
    itemPrice = parsed;
  }
}
```

Now savings are calculated correctly, or shown relative to the cheapest option if no valid original price exists.

### 2. 🎯 Poor Search Query Quality

**Problem**: Search queries were too specific and verbose:

- **Before**: "Ring Smart Lighting, Solar Black Motion Activated Outdoor Integrated LED Pathlight"
- This caused Google Shopping to return irrelevant generic products

**Solution**: Implemented smart query optimization:

1. **Remove noise words**: "Activated", "Integrated", "Enhanced", "Premium", etc.
2. **Intelligent truncation**: Keep first 6-8 most important words
3. **Better logging**: Shows original title vs optimized query

**Results**:

- **After**: "Ring Smart Lighting Solar LED Pathlight"
- More concise, better search results

### 3. 📊 Result Filtering (Relevance + Price Validation)

**Problem**: Google Shopping returned any products matching keywords, even if completely wrong (e.g., $5.50 generic lights instead of $40 Ring products, or $10 iPhone cases instead of $900 iPhones).

**Solution**: Implemented dual filtering system:

#### A. Relevance Scoring

```typescript
// Calculate relevance score
searchWords.forEach((word: string) => {
  if (resultTitle.includes(word)) {
    relevanceScore += 1;
  }
});

// Boost score if brand matches
if (searchSource && result.source.includes(searchSource)) {
  relevanceScore += 2;
}
```

**Filtering logic**:

- Results must match at least 20% of search terms
- Sort by **price first** (cheapest first), then relevance
- Filter out suspiciously low prices (<$1)
- **Skip if >70% discount** from original (likely wrong product)
- **Skip if >3x original price** (likely bundle/premium variant)
- Prioritize results from matching brand sources

### 4. 💰 Price Validation Filter

**Problem**: Search results included accessories, cases, or completely different products with wildly different prices.

**Examples**:

- Searching for $899 iPhone → Finding $29 phone case
- Searching for $100 headphones → Finding $15 replacement pads
- Searching for $50 item → Finding $200 deluxe bundle

**Solution**: Filter out results with unrealistic price differences:

```typescript
if (originalPrice && originalPrice > 0) {
  const discountPercent = ((originalPrice - price) / originalPrice) * 100;

  // Skip if >70% discount (likely accessories/wrong product)
  if (discountPercent > 70) {
    console.log(`Skipping unlikely match - ${discountPercent}% off`);
    return null;
  }

  // Skip if >3x original price (likely premium bundle)
  if (price > originalPrice * 3) {
    console.log(`Skipping overpriced result`);
    return null;
  }
}
```

**Results**:

- ✅ $899 iPhone → Shows $849-$999 options (realistic range)
- ❌ $899 iPhone → Skips $29 case (97% off)
- ✅ $100 headphones → Shows $85-$150 options
- ❌ $100 headphones → Skips $400 pro bundle (4x price)

**Edge Cases**:

- If no original price provided → No price filtering (show all)
- Threshold: Exactly 70% off is kept (e.g., $100 → $30 refurbished)
- Upper bound: Up to 3x is kept (e.g., $100 → $299 premium edition)

### 5. 🎨 UI Improvements

**Changes**:

- Fixed Next.js image configuration for Google Shopping thumbnails
- Better handling of savings display (hide if <$0.01)
- Added "Best Price" badge to cheapest option
- Improved layout with better spacing
- Scrollable results container (handles 1-20+ stores)

### 5. 📝 Better Logging

Added detailed console logs for debugging:

```
🔍 Google Shopping Search:
  - Original title: Ring Smart Lighting, Solar Black Motion Activated...
  - Optimized query: Ring Smart Lighting Solar LED Pathlight
  - Brand: Ring

📊 Relevance filtering: 20 total → 8 relevant (min score: 1)

✅ Returning 5 results, cheapest: $24.99
   1. Ring: $24.99
   2. Amazon: $27.99
   3. Home Depot: $29.99
```

## Testing Recommendations

### Good Test Products

**Electronics with Clear Brands**:

- "Apple AirPods Pro"
- "Sony WH-1000XM5 Headphones"
- "Samsung Galaxy S24"

**Home Goods**:

- "Instant Pot Duo 7-in-1"
- "Dyson V11 Vacuum"
- "Ring Video Doorbell"

**Avoid**:

- Overly generic terms ("LED Light", "Phone Charger")
- Very niche/rare products
- Products not sold in major retailers

## Known Limitations

1. **Google Shopping Coverage**: Not all products are indexed
2. **Regional Results**: Currently set to US only (gl=us parameter)
3. **Price Freshness**: Depends on when Google last crawled the store
4. **Brand Detection**: Simple pattern matching, may miss some brands

## Future Improvements

### Short Term

1. **Manual brand hints**: Allow users to specify brand in UI
2. **Better product matching**: Use model numbers, UPC codes
3. **Price alerts**: Notify when price drops
4. **Affiliate links**: Add tracking IDs to earn commissions

### Long Term

1. **Multi-region support**: Allow searching in different countries
2. **Historical pricing**: Track price trends over time
3. **Product variants**: Handle different colors/sizes
4. **AI-powered matching**: Use embeddings to find similar products

## Configuration

### Environment Variables

```bash
# Required
SERPAPI_KEY=your_api_key_here
```

### Next.js Image Configuration

```typescript
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**.gstatic.com",
      pathname: "/shopping/**",
    },
  ],
}
```

### Search Parameters

```typescript
// Can be adjusted in src/lib/price-comparison.ts
num: "20",        // Number of results to fetch
hl: "en",         // Language
gl: "us",         // Country/region
```

## Files Changed

1. **src/lib/price-comparison.ts**
   - Added relevance scoring
   - Improved query optimization
   - Better logging

2. **src/app/api/wishlist/find-cheapest/route.ts**
   - Fixed price parsing bug
   - Added price validation

3. **src/components/wishlist/PriceComparisonModal.tsx**
   - Better savings display
   - Added "Best Price" badge

4. **next.config.ts**
   - Configured external image domains

## Metrics to Monitor

### Quality Metrics

- **Relevance rate**: % of results that match the product
- **User satisfaction**: Do users click through to stores?
- **Conversion rate**: Do users make purchases?

### Cost Metrics

- **SerpAPI usage**: Stay within 5,000/month limit
- **Average response time**: Should be <5 seconds
- **Cache hit rate**: Should be >30% for popular items

### Revenue Metrics

- **Searches per day**: Total usage
- **Revenue**: $0.05 per search
- **Cost**: ~$0.01 per search
- **Profit margin**: ~80%

## Support

If results are still poor:

1. **Check the logs** - See what query was sent vs what was returned
2. **Try different wording** - Sometimes slight changes help
3. **Check SerpAPI dashboard** - See raw Google Shopping results
4. **Adjust noise words** - Add more terms to filter in the code
5. **Change relevance threshold** - Currently 20%, could go higher

---

**Last Updated**: November 3, 2025
