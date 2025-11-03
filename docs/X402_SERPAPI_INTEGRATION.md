# x402 SerpAPI Integration (ARCHIVED)

**Date**: November 3, 2025  
**Status**: ⚠️ **NOT IMPLEMENTED** - Archived for reference

## ⚠️ Important Note

**We attempted this approach but reverted to direct SerpAPI integration.**

**Reason**: The x402 proxy requires ERC-3009 `TransferWithAuthorization` (USDC permit-style payments), which is complex to implement server-side. Regular ERC-20 transfers don't work with this proxy.

**See instead**: [SERPAPI_DIRECT_IMPLEMENTATION.md](./SERPAPI_DIRECT_IMPLEMENTATION.md) for the actual implementation.

---

## Overview (Archived)

Instead of managing our own SerpAPI subscription, we **attempted** to use an **x402-gated SerpAPI proxy**. This would allow paying per search using crypto, eliminating the need for API key management and subscriptions.

**Note**: This documentation is kept for reference in case we revisit this approach in the future.

## How It Works

### Architecture

```
User
  ↓ Pays $0.05 USDC
Your API Endpoint (/api/wishlist/find-cheapest)
  ↓ Pays $0.01 USDC via x402
x402 SerpAPI Proxy (https://a6mg71so.nx.link)
  ↓ Makes request with their API key
SerpAPI
  ↓ Returns Google Shopping results
```

### Economics

- **User pays you**: $0.05 USDC (via x402)
- **You pay proxy**: $0.01 USDC (via x402)
- **Your profit**: $0.04 per search (~80% margin)

**No subscriptions needed!** Pay only for what you use.

## Implementation

### 1. Build Search URL

```typescript
import {
  buildGoogleShoppingUrl,
  extractProductInfo,
} from "@/lib/price-comparison";

const productInfo = extractProductInfo({
  title: item.title,
  url: item.url,
  description: item.description || "",
});

const searchUrl = buildGoogleShoppingUrl(productInfo);
// Returns: https://a6mg71so.nx.link/search.json?engine=google_shopping&q=...
```

### 2. Make x402 Payment (Manual Flow)

We implement the x402 protocol manually:

```typescript
// Step 1: Fetch endpoint (will return 402)
const initialResponse = await fetch(searchUrl);

if (initialResponse.status !== 402) {
  throw new Error(`Expected 402, got ${initialResponse.status}`);
}

// Step 2: Parse payment requirements
const paymentInfo = await initialResponse.json();
const accept = paymentInfo.accepts[0];

console.log("Payment required:", {
  network: accept.network, // "eip155:8453"
  asset: accept.asset, // USDC address
  amount: accept.maxAmountRequired, // "10000" (0.01 USDC)
  recipient: accept.payTo, // Recipient address
});

// Step 3: Make payment via thirdweb
const paymentResult = await thirdwebWriteContract(
  [
    {
      contractAddress: accept.asset,
      method: "function transfer(address to, uint256 amount) returns (bool)",
      params: [accept.payTo, accept.maxAmountRequired],
    },
  ],
  base.id,
  SERVER_WALLET,
);

const transactionQueueId = paymentResult.result.transactionIds[0];
console.log("Payment queued:", transactionQueueId);

// Step 3.5: Wait for transaction to be mined (CRITICAL!)
// Thirdweb returns a queue ID, not an on-chain tx hash
// The x402 proxy needs to verify the payment on-chain
let onChainTxHash: string | undefined;
let attempts = 0;

while (!onChainTxHash && attempts < 30) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  attempts++;

  const statusResponse = await fetch(
    `https://api.thirdweb.com/v1/transactions/${transactionQueueId}`,
    { headers: { "x-secret-key": THIRDWEB_SECRET_KEY } },
  );

  const statusData = await statusResponse.json();
  const status = statusData.result?.status;
  const txHash = statusData.result?.transactionHash;

  // Check for confirmed/mined/success status (case-insensitive)
  const statusLower = status?.toLowerCase();
  if (
    txHash &&
    (statusLower === "confirmed" ||
      statusLower === "mined" ||
      statusLower === "success")
  ) {
    onChainTxHash = txHash;
    console.log("✅ Transaction confirmed:", onChainTxHash);
    break; // Exit loop
  }
}

if (!onChainTxHash) {
  throw new Error("Transaction did not confirm in time");
}

// Step 4: Construct payment proof with on-chain tx hash
// x402 protocol requires specific structure with payment details
const paymentProofObj = {
  x402Version: 1,
  scheme: accept.scheme || "exact",
  network: "eip155:8453", // CAIP-2 format
  payload: {
    transaction: onChainTxHash, // Must be on-chain hash, not queue ID!
    payer: SERVER_WALLET.toLowerCase(),
    to: accept.payTo, // Recipient address
    value: accept.maxAmountRequired, // Amount paid
    asset: accept.asset, // Token address
  },
};

const paymentProofJson = JSON.stringify(paymentProofObj);

// Base64 encode the payment proof (x402 protocol requirement!)
const paymentProofBase64 = Buffer.from(paymentProofJson).toString("base64");

// Step 5: Retry with payment proof (base64-encoded)
const finalResponse = await fetch(searchUrl, {
  headers: {
    "X-Payment": paymentProofBase64, // Must be base64-encoded!
  },
});

const serpApiData = await finalResponse.json();
```

### 3. Parse Results

```typescript
import { parseGoogleShoppingResponse } from "@/lib/price-comparison";

const comparisonResults = parseGoogleShoppingResponse(serpApiData, itemPrice);

// Returns:
// {
//   cheapestPrice: 24.99,
//   stores: [...],
//   comparedAt: "2025-11-03T..."
// }
```

## Proxy Details

### Endpoint

`https://a6mg71so.nx.link/search.json`

### Payment Requirements

- **Network**: Base (eip155:8453)
- **Token**: USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **Amount**: 10,000 base units (0.01 USDC)
- **Recipient**: 0x758D2532FF6A304D1A0c2FdF46264590E4Ef0637

### Query Parameters

Same as SerpAPI:

- `engine=google_shopping`
- `q=<search query>`
- `num=20` (number of results)
- `hl=en` (language)
- `gl=us` (region)

### Response Format

Standard SerpAPI JSON response with `shopping_results` array.

## Benefits vs Direct SerpAPI

### ✅ Advantages

1. **No subscription management**
   - No monthly fees
   - No API key rotation
   - No rate limit tracking

2. **Pay-per-use**
   - $0.01 per search
   - Only pay for successful searches
   - No minimum commitment

3. **Crypto-native**
   - Fully on-chain payments
   - Transparent pricing
   - Instant settlement

4. **Simpler setup**
   - No SerpAPI account needed
   - One less credential to manage
   - Works with existing Thirdweb setup

### ⚠️ Considerations

1. **Requires USDC balance**
   - Server wallet must have USDC on Base
   - Need to top up periodically
   - Monitor balance to avoid failures

2. **Additional network dependency**
   - Relies on x402 proxy uptime
   - Extra network hop (minimal latency)

3. **x402 protocol dependency**
   - Requires Thirdweb x402 infrastructure
   - Payment must settle on-chain

## Setup

### Required Environment Variables

```bash
# Already required for your endpoint
THIRDWEB_SECRET_KEY=your_thirdweb_key
THIRDWEB_PROJECT_WALLET=your_wallet_address

# SERPAPI_KEY is NO LONGER REQUIRED! 🎉
```

### Server Wallet Requirements

Your server wallet (`THIRDWEB_PROJECT_WALLET`) needs:

1. **USDC on Base**
   - Minimum: ~$1 USDC for 100 searches
   - Recommended: $10+ for production
   - Check balance at: https://basescan.org/

2. **Small amount of ETH on Base**
   - For gas fees (~$0.0001 per transaction)
   - Minimum: 0.001 ETH

### Monitoring Wallet Balance

Add monitoring to track server wallet balance:

```typescript
// Check USDC balance
const balance = await thirdwebReadContract(
  [
    {
      contractAddress: USDC_TOKEN,
      method: "function balanceOf(address owner) view returns (uint256)",
      params: [SERVER_WALLET],
    },
  ],
  base.id,
);

const usdcBalance = Number(balance.result[0].result) / 1e6;
console.log(`Server wallet USDC balance: ${usdcBalance} USDC`);

// Alert if low
if (usdcBalance < 5) {
  console.warn("⚠️ Low USDC balance! Top up server wallet");
}
```

## Cost Analysis

### Per Search

- SerpAPI proxy: $0.01
- Gas fees: ~$0.0001
- **Total cost**: ~$0.0101

### Monthly (1,000 searches)

- Proxy costs: $10
- Gas fees: ~$0.10
- **Total**: ~$10.10

### Revenue (1,000 searches)

- User payments: $50 (1,000 × $0.05)
- Costs: $10.10
- **Profit**: $39.90 (~79% margin)

### Comparison to Direct SerpAPI

**x402 Proxy**:

- Fixed: $0
- Per search: $0.01
- 1,000 searches: $10

**Direct SerpAPI**:

- Starter plan: $50/month (5,000 searches included)
- Effective per-search: $0.01 (same!)
- But: requires subscription even if unused

**Winner**: x402 proxy for low volume (<5,000/month), direct SerpAPI for high volume.

## Error Handling

### Common Errors

**Insufficient USDC Balance**

```
Error: Thirdweb x402 fetch failed: 500 - Insufficient balance
```

**Solution**: Top up server wallet with USDC on Base

**Proxy Unavailable**

```
Error: Failed to fetch from x402 proxy
```

**Solution**: Check proxy status, fallback to error response

**Invalid Search Query**

```
Error: No shopping results found for this product
```

**Solution**: Already handled in code, returns 500 to user

### Retry Logic

Consider adding retry for transient errors:

```typescript
async function fetchWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## Testing

### Test x402 Payment

```bash
# Check server wallet has USDC
cast balance --erc20 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 \
  YOUR_SERVER_WALLET --rpc-url https://base.llamarpc.com

# Should return balance in base units (divide by 1e6 for USDC amount)
```

### Test Search

```bash
# Make request to your endpoint
curl -X POST http://localhost:3000/api/wishlist/find-cheapest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"item": {"id": "123", "title": "Apple AirPods Pro", ...}}'
```

### Monitor Logs

```
🔍 Google Shopping Search (via x402):
  - Original title: Apple AirPods Pro
  - Optimized query: Apple AirPods Pro
  - Brand: Apple

Making x402 payment to SerpAPI proxy ($0.01 USDC)...
✅ x402 payment successful, received SerpAPI data
📊 Relevance filtering: 20 total → 8 relevant (min score: 1)
✅ Returning 5 results, cheapest: $229.99
```

## Migrating from Direct SerpAPI

If you previously used direct SerpAPI:

1. ✅ **Remove SERPAPI_KEY** from `.env.local`
2. ✅ **Update imports** (already done)
3. ✅ **Ensure server wallet has USDC**
4. ✅ **Test with a search**
5. ✅ **Monitor costs** (should be similar or lower)

## Future Improvements

1. **Automatic top-up**
   - Monitor balance
   - Auto-transfer from multisig when low

2. **Failover**
   - Fall back to direct SerpAPI if proxy fails
   - Keep API key as backup

3. **Cost optimization**
   - Batch multiple searches
   - Aggressive caching
   - Smart query deduplication

4. **Alternative proxies**
   - Try other x402 SerpAPI providers
   - Compare pricing and reliability

## Related Documentation

- [PRICE_COMPARISON_IMPLEMENTATION.md](./PRICE_COMPARISON_IMPLEMENTATION.md) - Full implementation details
- [PRICE_COMPARISON_IMPROVEMENTS.md](./PRICE_COMPARISON_IMPROVEMENTS.md) - Recent improvements
- [X402_PAYMENTS.md](./X402_PAYMENTS.md) - x402 protocol overview

---

**Last Updated**: November 3, 2025
