# Testing Price Comparison Feature

This guide will help you test the newly implemented Google Shopping price comparison feature.

## Prerequisites

1. **Get SerpAPI Key**
   - Go to [https://serpapi.com/](https://serpapi.com/)
   - Sign up for a free account (100 searches/month)
   - Get your API key from the dashboard

2. **Add to Environment Variables**

   ```bash
   # Add to .env.local
   SERPAPI_KEY=your_api_key_here
   ```

3. **Restart Dev Server** (Required!)

   ```bash
   # Stop the server (Ctrl+C) and restart
   bun run dev
   ```

   **Note**: The `next.config.ts` has been updated to allow Google Shopping images. You **must restart** your dev server for this change to take effect.

## Enable the Feature in UI

The button is currently hidden. To test it, edit the FindCheapestButton component:

**File**: `src/components/wishlist/FindCheapestButton.tsx`

```typescript
// Line 98 - Change this:
<Button
  className="w-full hidden"  // Remove "hidden"

// To this:
<Button
  className="w-full"
```

## Testing Steps

### Test 1: Basic Functionality

1. **Create a wishlist item** with a common product:
   - Title: "Apple AirPods Pro"
   - URL: Any Amazon/retail link
   - Price: $249.99

2. **Click "Find Cheapest" button**

3. **Approve the payment** ($0.05 in USDC or WISH)

4. **Verify results show**:
   - Real Google Shopping data
   - 3-5 store options
   - Prices sorted from cheapest to most expensive
   - Store names, prices, savings
   - Product thumbnails (if available)
   - Ratings (if available)
   - Shipping info (if available)

### Test 2: Caching

1. Click "Find Cheapest" on the same item again

2. Should see faster response (cached)

3. Check the toast notification says "Showing previously cached results"

4. Verify no payment prompt (cache hit)

### Test 3: Different Products

Test with various product types:

**Electronics**:

- "Sony WH-1000XM5 Headphones"
- "Nintendo Switch OLED"

**Home Goods**:

- "Instant Pot Duo 7-in-1"
- "Dyson V11 Vacuum"

**Generic Items**:

- "HDMI Cable 6ft"
- "USB-C Charger 20W"

### Test 4: Edge Cases

**Long Titles**:

```
"Apple MacBook Pro 16-inch with M3 Max chip, 36GB RAM, 1TB SSD, Space Black"
```

- Should truncate and still find results

**Special Characters**:

```
"Women's Running Shoes - Size 8.5 (Wide)"
```

- Should clean up and search correctly

**Uncommon Products**:

```
"Vintage 1980s Widget Maker Model XYZ-123"
```

- Should handle "no results found" gracefully

## What to Check

### API Response Format

Check browser console for:

```json
{
  "success": true,
  "cached": false,
  "results": {
    "cheapestPrice": 229.99,
    "stores": [
      {
        "name": "Amazon",
        "price": 229.99,
        "url": "https://amazon.com/...",
        "savings": 20.0,
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

### Database Caching

Check Supabase `price_comparisons` table:

- Should see new entries after searches
- `expires_at` should be 7 days from now
- `results` field contains the comparison data

### Payment Logs

Check server logs for:

```
Payment received in USDC: {
  transactionId: "0x...",
  payer: "0x...",
  amount: "50000",
  readableAmount: "0.05 USDC"
}

Searching for product: {
  title: "Apple AirPods Pro",
  searchQuery: "Apple AirPods Pro"
}

Found 5 stores, cheapest: $229.99

Sweeping entire USDC balance to personal wallet
```

## Common Issues

### "SERPAPI_KEY environment variable is required"

- Add the API key to `.env.local`
- Restart dev server

### "No shopping results found for this product"

- Product may not be on Google Shopping
- Try a more common product name
- Check SerpAPI dashboard for actual query

### Payment prompt not showing

- Check that wallet is connected
- Verify user is signed in (JWT token present)
- Check browser console for errors

### Prices look incorrect

- Verify SerpAPI is returning valid data
- Check the `extracted_price` field in API response
- Some stores may have promotional pricing

### Images not loading

- Some stores don't provide thumbnails
- CORS issues with external images
- Try different products

## Performance Monitoring

### Expected Response Times

- **First search**: 2-5 seconds (API call + payment)
- **Cached search**: <1 second
- **Payment settlement**: 1-3 seconds

### Cost Tracking

Monitor your SerpAPI usage at [https://serpapi.com/dashboard](https://serpapi.com/dashboard)

- Free tier: 100 searches/month
- Each "Find Cheapest" click = 1 search
- Track to avoid overages

## Success Criteria

✅ Button appears on wishlist items
✅ Payment flow works ($0.05 USDC/WISH)
✅ Real Google Shopping data returns
✅ Results show 3-5 stores sorted by price
✅ Thumbnails and ratings display (when available)
✅ Caching works (7 days)
✅ Second request is instant (cache hit)
✅ Payment sweeps to multisig wallet
✅ No console errors
✅ Modal displays results nicely

## Next Steps After Testing

Once testing is successful:

1. **Remove the `hidden` class** to make button visible
2. **Update toast description** with correct payment token (WISH vs USDC)
3. **Consider affiliate links** (add tracking IDs to URLs)
4. **Monitor SerpAPI costs** vs revenue
5. **Gather user feedback** on results quality
6. **Add analytics** to track usage

## Support

If you encounter issues:

1. Check server logs for errors
2. Verify SerpAPI dashboard shows the queries
3. Test with different products
4. Check Supabase for cached entries
5. Verify payment transactions on-chain

---

**Last Updated**: November 3, 2025
