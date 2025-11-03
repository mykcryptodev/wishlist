# Installment Pricing Support

**Date**: November 3, 2025

## Issue Fixed

Some products on Google Shopping show **installment pricing** (e.g., "$37.45/mo for 24 months") instead of total prices. Without handling this, we were comparing monthly payments to full prices, causing incorrect price comparisons.

### Example

**Before** (WRONG):

- iPhone showing as $37.45 (monthly)
- MacBook showing as $2,158 (total)
- iPhone appears "cheaper" ❌

**After** (CORRECT):

- iPhone: $37.45 × 24 months = **$898.80 total**
- MacBook: **$2,158 total**
- Prices properly compared ✅

## Implementation

### Detection & Calculation

```typescript
// Check for installment pricing in SerpAPI response
if (result.installment && result.installment.period) {
  const monthlyPrice = result.installment.extracted_price; // $37.45
  const months = result.installment.period; // 24
  price = monthlyPrice * months; // $898.80

  // Store for display
  installmentInfo = { monthlyPrice, months };
}
```

### Data Structure

Added `installment` field to price results:

```typescript
interface PriceResult {
  price: number; // Total price (calculated for installments)
  installment?: {
    monthlyPrice: number; // Monthly payment
    months: number; // Number of months
  };
}
```

### UI Display

Modal now shows both total price and monthly breakdown:

```
$898.80                    ← Total price (used for comparison)
$37.45/mo for 24 months   ← Installment details (for user info)
```

## SerpAPI Response Format

### Example Installment Object

```json
{
  "price": "$37.45/mo",
  "extracted_price": 37.45,
  "installment": {
    "price": "$37.45/mo",
    "extracted_price": 37.45,
    "period": 24
  }
}
```

### Fields Used

- `installment.extracted_price` - Monthly payment amount
- `installment.period` - Number of months
- **Calculated**: `total = monthly × period`

## Benefits

### Accurate Price Comparison ✅

All prices normalized to total cost:

- Regular prices: use as-is
- Installment prices: calculate total
- Comparable apples-to-apples

### Transparent to Users ✅

Users see:

1. **Total price** (for comparison)
2. **Monthly breakdown** (for budgeting)
3. Both pieces of information clearly displayed

### Prevents Misleading Results ✅

Without this fix:

- $37/mo item appears cheapest
- User clicks, finds out it's $900 total
- Bad experience ❌

With this fix:

- $900 total shown upfront
- Monthly option clearly indicated
- User makes informed decision ✅

## Testing

### Products with Installment Pricing

Common on:

- iPhones (Apple, carriers)
- MacBooks (Apple, Best Buy)
- High-end electronics
- Furniture (Wayfair, Ashley)

### Verify

Check logs for:

```
Installment pricing: $37.45/mo × 24 months = $898.8 total
```

And UI shows:

```
$898.80
$37.45/mo for 24 months
```

## Edge Cases Handled

### Missing Period

```typescript
if (result.installment && result.installment.period) {
  // Only calculate if period exists
}
```

### Zero or Invalid Values

```typescript
if (!price || isNaN(price) || price <= 0) {
  return null; // Skip invalid
}
```

### Mixed Results

- Some installment, some regular → All normalized to total price
- Sorted correctly by total cost

## Files Modified

1. **src/lib/price-comparison.ts**
   - Added installment detection
   - Calculate total price from monthly × months
   - Store installment info for display

2. **src/hooks/useFindCheapestPrice.ts**
   - Updated TypeScript interface
   - Added `installment?` field

3. **src/components/wishlist/PriceComparisonModal.tsx**
   - Display installment details
   - Show monthly breakdown under total price

## Future Improvements

### Highlight Financing Options

```typescript
{store.installment && (
  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
    Financing Available
  </span>
)}
```

### Interest Rates

Some installments include interest - could show APR if available in SerpAPI response.

### Filter by Payment Type

Allow users to filter:

- "Full price only"
- "Financing available"
- "Show all"

---

**Last Updated**: November 3, 2025
