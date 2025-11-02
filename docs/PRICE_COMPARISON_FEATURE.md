# Price Comparison Feature (x402 Implementation)

## Overview

The Price Comparison feature allows users to pay $0.05 in crypto to find the cheapest places to buy wishlist items online. This is implemented using Thirdweb's x402 payment protocol.

**Created**: November 2, 2025

## Features

### 🔒 x402 Paywall

- Users pay $0.05 (in any supported token) to access price comparison
- Payment verified before expensive work (two-phase verification)
- Automatic payment settlement via Thirdweb facilitator

### 💾 Smart Caching

- Results cached in Supabase for 7 days
- Prevents double-charging users for the same item
- Returns cached results instantly if available

### 🎨 User Experience

- "Find Cheapest" button on all wishlist item cards
- Toast notifications for payment and search progress
- Beautiful modal displaying price comparison results
- Shows savings amount for each store
- React Query manages loading/error states automatically
- Mutation state resets when modal closes

### 🏪 Dummy Data (For Now)

- Currently returns mock data with 15% discount
- Shows prices from Amazon, Walmart, and Target
- Ready to integrate real price scraping/API later

## Architecture

```
User clicks button
    ↓
useFindCheapestPrice hook
    ↓
POST /api/wishlist/find-cheapest
    ↓
settlePayment (x402) - VERIFY & SETTLE
    ↓
Check cache (Supabase)
    ↓
Generate results (or return cached)
    ↓
Display in PriceComparisonModal
```

## Implementation

### Database Schema

Added `price_comparisons` table to Supabase:

```sql
CREATE TABLE IF NOT EXISTS price_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    item_data JSONB NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);
```

**Fields:**

- `item_id`: Wishlist item ID
- `wallet_address`: User who requested comparison
- `item_data`: Full item object for reference
- `results`: Price comparison results JSON
- `expires_at`: Auto-cleanup after 7 days

### API Endpoint

**Path**: `/api/wishlist/find-cheapest`

**Method**: POST

**Authentication**: Required (JWT token)

**Payment**: $0.05 USD (via x402)

**Request Body**:

```json
{
  "item": {
    "id": "1",
    "title": "Product Name",
    "price": "100000000000000000000",
    "url": "https://...",
    ...
  }
}
```

**Response** (Success):

```json
{
  "success": true,
  "results": {
    "cheapestPrice": 85.0,
    "stores": [
      {
        "name": "Amazon",
        "price": 85.0,
        "url": "https://...",
        "savings": 15.0
      }
    ],
    "comparedAt": "2025-11-02T..."
  },
  "cached": false
}
```

**Response** (Payment Required - 402):

```json
{
  "x-402-price": "$0.05",
  "x-402-payment-token": "0x...",
  "x-402-chain-id": "8453"
}
```

### Components

#### FindCheapestButton

- **Location**: `src/components/wishlist/FindCheapestButton.tsx`
- **Usage**: `<FindCheapestButton item={item} />`
- **Features**:
  - Loading states
  - Toast notifications
  - Opens results modal automatically
  - Handles payment errors gracefully

#### PriceComparisonModal

- **Location**: `src/components/wishlist/PriceComparisonModal.tsx`
- **Features**:
  - Shows best price prominently
  - Lists all stores with prices and savings
  - Links to each store
  - Shows when comparison was performed

### Hook

#### useFindCheapestPrice

- **Location**: `src/hooks/useFindCheapestPrice.ts`
- **Technology**: React Query (TanStack Query) for state management
- **Usage**:

```typescript
const {
  findCheapestPriceAsync, // Async function that returns a promise
  findCheapestPrice, // Fire-and-forget mutation
  isLoading, // Loading state
  results, // Current results
  error, // Error if any
  isError, // Error state
  isSuccess, // Success state
  reset, // Reset mutation state
} = useFindCheapestPrice();

// Make request
const result = await findCheapestPriceAsync(item);

if (result.needsPayment) {
  // Handle payment
}

if (result.success) {
  // Show results modal
}
```

**Benefits of React Query**:

- Automatic retry logic (disabled for payment requests)
- Better state management (loading, error, success)
- Built-in caching at the React Query level
- Optimistic updates support
- Better developer experience

## Security Features

### Two-Phase Payment Verification

The endpoint uses a two-phase approach:

1. **Phase 1: Verify Payment**
   - Calls `settlePayment()` immediately
   - Returns 402 if payment missing/invalid
   - Verifies payment on-chain before proceeding

2. **Phase 2: Expensive Work**
   - Only executes after payment verified
   - Checks cache first (free)
   - Generates new results if needed
   - Saves to cache

This prevents wasting resources on invalid payments and protects against:

- Users trying to access without payment
- Invalid payment attempts
- Insufficient payment amounts

### Cache Benefits

- **Prevents double-charging**: Same user + same item = cached result
- **Performance**: Instant response for cached results
- **Cost savings**: No duplicate API calls
- **User experience**: Faster results on subsequent requests

## Payment Flow

### Prerequisites

**User must be signed in first!**

1. Connect wallet (using Connect Wallet button)
2. Click "Sign In" button in navigation
3. Sign the SIWE message
4. Now authenticated for API requests

### First Time (No Cache)

1. User clicks "Find Cheapest" button
2. If not signed in → Toast: "Please sign in first"
3. If signed in → Toast: "Finding cheapest prices..."
4. API returns 402 Payment Required
5. Toast: "Payment required: $0.05"
6. User approves payment via wallet
7. User clicks button again
8. Payment verified ✓
9. Price comparison performed
10. Results saved to cache
11. Modal displays results
12. Toast: "Price comparison complete!"

### Second Time (Cached)

1. User clicks "Find Cheapest" button
2. Toast: "Finding cheapest prices..."
3. Payment verified ✓
4. Cache hit - return instantly
5. Modal displays results
6. Toast: "Price comparison retrieved!" (cached)

## Integration Points

### WishlistItemCard

The button is integrated in both view modes:

**Owner View**:

- Below Edit/Delete buttons
- Allows owners to find deals

**Public View**:

- Below "I'll Get This" button
- Helps purchasers find best price

```typescript
<FindCheapestButton item={item} variant="outline" size="sm" />
```

## Future Enhancements

### Real Price Comparison

Replace dummy data with actual price scraping/APIs:

```typescript
// In /api/wishlist/find-cheapest/route.ts
// Replace this:
const dummyResults = { ... };

// With real implementation:
const results = await fetchRealPrices(item);
```

**Potential APIs**:

- Google Shopping API
- PriceAPI
- Keepa (Amazon)
- Custom web scraping

### Additional Features

1. **Price History**
   - Track price changes over time
   - Alert when price drops

2. **More Stores**
   - Expand beyond Amazon/Walmart/Target
   - International stores
   - Specialty retailers

3. **Price Alerts**
   - Notify when item drops below threshold
   - Email or push notifications

4. **Affiliate Links**
   - Add affiliate IDs to URLs
   - Generate revenue from clicks

## Configuration

### Price Adjustment

To change the payment price:

```typescript
// In /api/wishlist/find-cheapest/route.ts
price: "$0.05", // Change this value
```

### Cache Duration

To change cache expiration:

```sql
-- In supabase-schema.sql
expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
-- Change '7 days' to desired duration
```

### Payment Token

Uses Base mainnet by default. To change chain:

```typescript
// In /api/wishlist/find-cheapest/route.ts
import { arbitrum } from "thirdweb/chains";

network: arbitrum, // Change from base
```

## Testing

### Manual Testing Steps

1. **Test Payment Flow**:
   - Click "Find Cheapest" button
   - Verify 402 response
   - Complete payment
   - Verify results appear

2. **Test Caching**:
   - Click button for same item
   - Verify instant response
   - Check "cached: true" in response

3. **Test Both Views**:
   - Test as owner on your own wishlist
   - Test as viewer on someone else's wishlist

### Database Check

Verify results are cached:

```sql
SELECT * FROM price_comparisons
WHERE wallet_address = '0x...'
ORDER BY created_at DESC;
```

## Troubleshooting

### Payment Not Working

- Verify `THIRDWEB_PROJECT_WALLET` is set
- Check wallet has sufficient balance
- Ensure x402 facilitator is initialized

### Results Not Caching

- Check Supabase connection
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check table exists with correct schema

### Button Not Appearing

- Verify import in `WishlistItemCard.tsx`
- Check console for errors
- Ensure wallet is connected

### "Please sign in first" Error

- You need to sign in with SIWE (Sign-In with Ethereum)
- Steps:
  1. Connect your wallet (using Connect Wallet button)
  2. Click the "Sign In" button in the navigation
  3. Sign the message in your wallet
  4. Try the "Find Cheapest" button again
- Note: Connecting wallet ≠ Signing in
- SIWE creates a JWT token for authenticated API requests

## Resources

- [x402 Protocol Documentation](https://x402.org)
- [Thirdweb x402 Guide](https://portal.thirdweb.com/payments/x402)
- [Main x402 Payments Doc](./X402_PAYMENTS.md)
- [Thirdweb API Guide](./THIRDWEB_API.md)
