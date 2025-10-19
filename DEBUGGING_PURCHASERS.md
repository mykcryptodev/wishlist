# Debugging Purchaser Signup Issue

## Issue

User signs up as a purchaser but the dialog shows "nobody has signed up".

## Root Causes Identified

### 1. Timing Issue

**Problem:** The blockchain transaction completes, but the state isn't immediately readable when we fetch the data.

**Solution:** Added a 1.5 second delay after transaction success before refetching purchaser data:

```typescript
setTimeout(() => {
  fetchPurchasers();
  onPurchaserChange?.();
}, 1500);
```

### 2. Data Format Issues

**Problem:** The smart contract returns data in various formats (BigInt, arrays, tuples) that need proper conversion.

**Solution:** Added robust data parsing in the API endpoint:

```typescript
// Convert BigInt to strings
const purchasers = Array.isArray(purchasersRaw)
  ? purchasersRaw.map((p: any) => ({
      purchaser: p.purchaser || p[0],
      signedUpAt:
        typeof p.signedUpAt === "bigint"
          ? p.signedUpAt.toString()
          : p.signedUpAt?.toString() || p[1]?.toString() || "0",
      exists: p.exists ?? p[2] ?? true,
    }))
  : [];
```

### 3. Missing Debug Information

**Problem:** No visibility into what data is being returned from the blockchain.

**Solution:** Added comprehensive logging:

- API endpoint logs raw and processed data
- Frontend logs fetched data
- Console logs show purchaser list state

## How to Debug

### Step 1: Check Browser Console

After signing up, open browser console (F12) and look for:

```
Fetched purchasers data: {success: true, purchasers: [...], count: 1}
Setting purchasers: [{purchaser: "0x...", signedUpAt: "1234567890", exists: true}]
```

### Step 2: Check Server Logs

Look at your Next.js server terminal for:

```
[GET Purchasers] Raw data from contract: {
  purchasersRaw: [...],
  countRaw: 1n,
  itemId: "123"
}
[GET Purchasers] Processed data: {
  purchasersCount: 1,
  count: 1,
  itemId: "123"
}
```

### Step 3: Use Manual Refresh

Click the refresh icon (🔄) in the purchasers dialog to manually reload the list.

### Step 4: Check Network Tab

1. Open DevTools → Network tab
2. Sign up as purchaser
3. Look for the request to `/api/wishlist/[itemId]/purchasers`
4. Check the response body

### Step 5: Verify Blockchain State

If data still doesn't show, the transaction might not be confirmed. Check:

1. Transaction hash in the success toast
2. Block explorer (e.g., Etherscan) to verify transaction was mined
3. Smart contract read functions directly

## Common Issues & Solutions

### Issue: Empty Array Returned

**Symptoms:** `purchasers: []` in console logs

**Possible Causes:**

1. Transaction not yet mined
2. Reading from wrong chain
3. Item ID mismatch
4. Smart contract not updated

**Solutions:**

- Wait a few more seconds and click refresh
- Verify you're on the correct network
- Check the item ID in the URL and logs
- Verify smart contract deployment

### Issue: Data Format Errors

**Symptoms:** `Cannot read property 'purchaser' of undefined`

**Possible Causes:**

1. Unexpected data structure from contract
2. BigInt serialization issues
3. Tuple vs object mismatch

**Solutions:**

- Check server logs for raw data structure
- Update mapping function to handle actual format
- Convert BigInt values properly

### Issue: Stale Data

**Symptoms:** Old purchaser count shown

**Possible Causes:**

1. React state not updating
2. Dialog not refetching on open
3. Cache issues

**Solutions:**

- Click the manual refresh button
- Close and reopen the dialog
- Check `useEffect` dependencies

## Testing Checklist

After making these changes, test:

- [ ] Sign up as purchaser
- [ ] Wait for success toast
- [ ] Check console logs for fetched data
- [ ] Verify purchaser appears in dialog
- [ ] Test manual refresh button
- [ ] Sign up second user
- [ ] Verify count updates
- [ ] Remove yourself as purchaser
- [ ] Verify you're removed from list

## Expected Console Output

### Successful Signup Flow:

```
1. POST /api/wishlist/123/purchasers
   → {success: true, transactionId: "txn_xyz"}

2. Transaction monitoring...
   → Status: pending
   → Status: success

3. GET /api/wishlist/123/purchasers?itemId=123 (after delay)
   → Server: [GET Purchasers] Raw data from contract: {...}
   → Server: [GET Purchasers] Processed data: {purchasersCount: 1, count: 1}
   → Frontend: Fetched purchasers data: {success: true, purchasers: [...], count: 1}
   → Frontend: Setting purchasers: [{purchaser: "0x...", ...}]
```

## If Issue Persists

1. **Check Transaction Status:**
   - Copy transaction ID from toast
   - Check on block explorer
   - Verify it's confirmed (not just pending)

2. **Verify Smart Contract:**
   - Ensure contract is deployed to correct network
   - Check contract address matches in constants
   - Verify the `getPurchasers` function works

3. **Test Direct Contract Read:**

   ```typescript
   // In browser console
   const response = await fetch("/api/wishlist/123/purchasers?itemId=123");
   const data = await response.json();
   console.log(data);
   ```

4. **Check Item ID:**
   - Ensure item ID in URL matches the actual item
   - Verify item exists in smart contract

## Changes Made

### PurchasersDialog.tsx

- ✅ Added 1.5s delay before refetch after transaction
- ✅ Added debug logging for fetched data
- ✅ Added array validation for purchasers
- ✅ Added manual refresh button

### route.ts (purchasers API)

- ✅ Added comprehensive logging
- ✅ Added BigInt conversion
- ✅ Added robust data parsing for different formats
- ✅ Added array/tuple handling

## Next Steps

1. Test the signup flow again
2. Check both browser and server console logs
3. Use the manual refresh button if needed
4. Share the console output if issue persists

The debug logs will help identify exactly where the data flow breaks down.
