# x402 Payments Implementation Guide

This guide explains how to implement x402 payments in your wishlist app using Thirdweb's x402 support. x402 is an open-source protocol that turns the HTTP 402 Payment Required status code into a fully-featured, on-chain payment layer for APIs.

Learn more about the protocol at [x402.org](https://x402.org).

## Overview

x402 allows you to:

- Make API endpoints payable with on-chain crypto payments
- Automatically handle payment verification and settlement
- Support both client-side and server-side payment flows
- Accept payments in any ERC20 token or native tokens

## Architecture

```
Client → Payable API Endpoint → settlePayment() → Facilitator → Blockchain
                                      ↓
                            Payment Verification
                                      ↓
                            Response (402 if unpaid, 200 if paid)
```

## Prerequisites

1. **Thirdweb Setup**: Your app already has Thirdweb configured
2. **Server Wallet**: You need `THIRDWEB_PROJECT_WALLET` environment variable set
3. **Chain**: Base mainnet (already configured)

## Server-Side Implementation

### Step 1: Create a Facilitator

A facilitator handles verifying and settling payments on-chain. Create a facilitator utility:

```typescript
// src/lib/x402-facilitator.ts
import { createThirdwebClient } from "thirdweb";
import { facilitator } from "thirdweb/x402";
import { base } from "thirdweb/chains";

const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY!;
const SERVER_WALLET_ADDRESS = process.env.THIRDWEB_PROJECT_WALLET!;

if (!THIRDWEB_SECRET_KEY || !SERVER_WALLET_ADDRESS) {
  throw new Error("Missing required x402 environment variables");
}

const client = createThirdwebClient({
  secretKey: THIRDWEB_SECRET_KEY,
});

export const x402Facilitator = facilitator({
  client,
  serverWalletAddress: SERVER_WALLET_ADDRESS,
  network: base, // Base mainnet
});
```

### Step 2: Create a Payable Endpoint

Create an API route that requires payment using `settlePayment`:

```typescript
// src/app/api/premium/route.ts
import { NextRequest, NextResponse } from "next/server";
import { settlePayment } from "thirdweb/x402";
import { base } from "thirdweb/chains";
import { x402Facilitator } from "@/lib/x402-facilitator";

export async function GET(request: NextRequest) {
  // Get payment data from request headers
  const paymentData = request.headers.get("x-payment");

  // Settle the payment
  const result = await settlePayment({
    resourceUrl: request.url,
    method: "GET",
    paymentData,
    payTo: process.env.THIRDWEB_PROJECT_WALLET!,
    network: base,
    price: "$0.01", // Price in USD, will be converted to tokens
    facilitator: x402Facilitator,
    routeConfig: {
      description: "Access to premium API content",
      mimeType: "application/json",
      maxTimeoutSeconds: 300,
    },
  });

  // If payment was successful (status 200), return content
  if (result.status === 200) {
    return NextResponse.json({
      data: "premium content here",
      message: "Payment successful!",
    });
  }

  // Otherwise, return the payment request (status 402)
  return NextResponse.json(result.responseBody, {
    status: result.status,
    headers: result.responseHeaders,
  });
}
```

### Payment Flow

1. **Initial Request** (no payment):
   - Client makes request without `x-payment` header
   - Server returns `402 Payment Required` with payment details

2. **Payment Request**:
   - Response includes:
     - `x-402-price`: Price in USD
     - `x-402-payment-token`: Token address to pay with
     - `x-402-chain-id`: Chain ID (8453 for Base)
     - `x-402-payment-url`: URL to initiate payment

3. **Client Pays**:
   - Client calls payment URL or uses Thirdweb SDK
   - Payment is settled on-chain

4. **Retry Request** (with payment):
   - Client includes `x-payment` header with payment proof
   - Server verifies payment and returns content (200 OK)

## Client-Side Implementation

### Option 1: Using Thirdweb SDK `wrapFetchWithPayment`

Wrap the native fetch API to automatically handle 402 responses:

```typescript
import { wrapFetchWithPayment } from "thirdweb/x402";
import { createThirdwebClient } from "thirdweb";
import { createWallet } from "thirdweb/wallets";

// Initialize
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});
const wallet = createWallet("io.metamask");
await wallet.connect({ client });

// Create wrapped fetch
const fetchWithPay = wrapFetchWithPayment(fetch, client, wallet);

// Make paid request - automatically handles payment
const response = await fetchWithPay("https://api.example.com/premium");
const data = await response.json();
```

### Option 2: Using Thirdweb API Directly

You can also use the Thirdweb HTTP API to fetch and pay for x402 endpoints:

```typescript
import { createThirdwebClient } from "thirdweb";
import { fetchWithPayment } from "thirdweb/x402";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// Make request with automatic payment handling
const response = await fetchWithPayment({
  url: "https://api.example.com/premium",
  client,
  wallet, // Authenticated wallet
});
```

## Configuration Options

### Price Configuration

You can set prices in different ways:

```typescript
// USD price (automatically converts to tokens)
price: "$0.01"

// Native token amount
price: {
  amount: "1000000000000000", // 0.001 ETH in wei
  currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native token
  chainId: 8453,
}

// ERC20 token amount
price: {
  amount: "1000000", // 1 USDC (6 decimals)
  currency: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
  chainId: 8453,
}
```

### Route Configuration

```typescript
routeConfig: {
  description: "Access to premium content", // Human-readable description
  mimeType: "application/json", // Content type
  maxTimeoutSeconds: 300, // Payment timeout (5 minutes)
}
```

## Real-World Implementation: Price Comparison Feature

The wishlist app includes a production x402 implementation for finding the cheapest places to buy items. Users pay $0.05 to access price comparison results.

### Files

- **API Endpoint**: `src/app/api/wishlist/find-cheapest/route.ts`
- **Hook**: `src/hooks/useFindCheapestPrice.ts`
- **Button Component**: `src/components/wishlist/FindCheapestButton.tsx`
- **Results Modal**: `src/components/wishlist/PriceComparisonModal.tsx`
- **Database Schema**: `supabase-schema.sql` (price_comparisons table)

### Key Features

1. **Two-Phase Verification**: Payment is verified before expensive price comparison work
2. **Result Caching**: Results cached for 7 days to avoid double-charging users
3. **Toast Notifications**: User feedback during the payment and search process
4. **Results Modal**: Clean UI for displaying price comparison results
5. **React Query Integration**: Modern state management with automatic retry and caching

### Usage

The "Find Cheapest" button appears on all wishlist item cards. When clicked:

1. Makes request to x402 endpoint
2. If payment required (first time), shows payment prompt
3. After payment, performs price comparison
4. Displays results in a modal
5. Caches results for 7 days

## Example: Premium Wishlist Analytics

Here's another example of a payable endpoint for premium analytics:

```typescript
// src/app/api/wishlist/premium-analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { settlePayment } from "thirdweb/x402";
import { base } from "thirdweb/chains";
import { x402Facilitator } from "@/lib/x402-facilitator";
import { requireAuth } from "@/lib/auth-utils";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user first
    const walletAddress = await requireAuth(request);

    // Get payment data
    const paymentData = request.headers.get("x-payment");

    // Settle payment
    const paymentResult = await settlePayment({
      resourceUrl: request.url,
      method: "GET",
      paymentData,
      payTo: process.env.THIRDWEB_PROJECT_WALLET!,
      network: base,
      price: "$0.10", // $0.10 for premium analytics
      facilitator: x402Facilitator,
      routeConfig: {
        description: "Premium wishlist analytics and insights",
        mimeType: "application/json",
        maxTimeoutSeconds: 300,
      },
    });

    // If payment failed, return payment request
    if (paymentResult.status !== 200) {
      return NextResponse.json(paymentResult.responseBody, {
        status: paymentResult.status,
        headers: paymentResult.responseHeaders,
      });
    }

    // Payment successful - return premium analytics
    const { data: wishlists } = await supabaseAdmin
      .from("wishlists")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase());

    // Calculate analytics
    const analytics = {
      totalItems: wishlists?.length || 0,
      totalValue: wishlists?.reduce((sum, w) => sum + (w.price || 0), 0) || 0,
      averagePrice: wishlists?.length
        ? wishlists.reduce((sum, w) => sum + (w.price || 0), 0) /
          wishlists.length
        : 0,
      mostWantedCategory: "electronics", // Simplified example
      trends: [
        { month: "January", items: 5 },
        { month: "February", items: 8 },
      ],
    };

    return NextResponse.json({
      analytics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in premium analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
```

## Error Handling

Handle common errors:

```typescript
try {
  const result = await settlePayment({...});

  if (result.status === 200) {
    // Payment successful
  } else if (result.status === 402) {
    // Payment required - return to client
  } else {
    // Other error
  }
} catch (error) {
  // Handle facilitator or network errors
  console.error("Payment settlement error:", error);
  return NextResponse.json(
    { error: "Payment processing failed" },
    { status: 500 }
  );
}
```

## Security Considerations

1. **Never Expose Secret Keys**: Keep `THIRDWEB_SECRET_KEY` server-side only
2. **Verify Payments**: Always use `settlePayment` - it verifies payments on-chain
3. **Validate Users**: Combine x402 with your existing auth (`requireAuth`)
4. **Rate Limiting**: Consider adding rate limiting for paid endpoints
5. **Price Validation**: Don't allow user-controlled prices

## Testing

### Test Payment Flow

1. **Without Payment**:

```bash
curl https://your-app.com/api/premium
# Returns 402 Payment Required
```

2. **With Payment** (from client):

```typescript
const fetchWithPay = wrapFetchWithPayment(fetch, client, wallet);
const response = await fetchWithPay("https://your-app.com/api/premium");
// Automatically handles payment and returns content
```

## Resources

- [Thirdweb x402 Documentation](https://portal.thirdweb.com/payments/x402)
- [x402 Protocol](https://x402.org)
- [Thirdweb Payments API](https://portal.thirdweb.com/payments)
- [Base Network Docs](https://docs.base.org)

## Troubleshooting

### Payment Not Settling

- Check that `THIRDWEB_PROJECT_WALLET` has sufficient funds
- Verify the facilitator is using the correct chain
- Check that the price is set correctly

### 402 Response Not Working

- Ensure `x-payment` header is being read correctly
- Verify the facilitator is initialized properly
- Check that the `settlePayment` function is being called

### Client Payment Fails

- Verify wallet is connected and has sufficient balance
- Check that the token contract exists on Base
- Ensure the payment URL is accessible
