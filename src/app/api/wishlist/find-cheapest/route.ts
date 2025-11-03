/**
 * x402-gated Price Comparison API Endpoint
 *
 * This endpoint requires payment ($0.05 in crypto) to access.
 * It finds the cheapest places to buy wishlist items.
 *
 * Features:
 * - Two-phase payment verification (before expensive work)
 * - Caches results in Supabase for 7 days
 * - Returns dummy data for now (to be replaced with real price comparison)
 */

import { NextRequest, NextResponse } from "next/server";
import { toEther, toTokens } from "thirdweb";
import { base } from "thirdweb/chains";
import { settlePayment } from "thirdweb/x402";

import { multisig, usdc, wish } from "@/constants";
import { requireAuth } from "@/lib/auth-utils";
import {
  checkSerpApiAvailability,
  extractProductInfo,
  searchGoogleShopping,
} from "@/lib/price-comparison";
import { CACHE_TTL, redis } from "@/lib/redis";
import {
  thirdwebReadContract,
  thirdwebWriteContract,
} from "@/lib/thirdweb-http-api";
import { x402Facilitator } from "@/lib/x402-facilitator";

const SERVER_WALLET = process.env.THIRDWEB_PROJECT_WALLET!;
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY!;

// ============================================================================
// PAYMENT CONFIGURATION - Toggle between USDC and WISH
// ============================================================================
const USE_WISH_TOKEN = false; // Set to true for WISH, false for USDC (easier for testing)
const TARGET_PRICE_USD = 0.05; // $0.05 USD

// Token addresses
const WISH_TOKEN = wish[base.id] as `0x${string}`;
const USDC_TOKEN = usdc[base.id] as `0x${string}`;

// USDC configuration (6 decimals)
const USDC_AMOUNT = "50000"; // 0.05 USDC = 50,000 base units

/**
 * Fetch current WISH token price and calculate payment amount
 * Uses BigInt math to avoid conversion errors
 */
async function calculateWishPaymentAmount(): Promise<string> {
  try {
    const response = await fetch(
      `https://api.thirdweb.com/v1/tokens?limit=1&page=1&chainId=${base.id}&tokenAddress=${WISH_TOKEN}`,
      {
        headers: {
          "x-secret-key": THIRDWEB_SECRET_KEY,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch WISH token price: ${response.status}`);
    }

    const data = await response.json();
    const wishToken = data.result.tokens[0];

    if (!wishToken || !wishToken.priceUsd) {
      throw new Error("WISH token price not available");
    }

    const priceUsd = wishToken.priceUsd; // e.g., 0.000004273317301
    const decimals = wishToken.decimals; // 18

    // Calculate amount: (targetUSD / priceUSD) to get token amount in ether
    // Round up to nearest whole token to keep it simple and avoid precision errors

    const tokensInEther = TARGET_PRICE_USD / priceUsd; // e.g., 9691.537
    const tokensRounded = Math.ceil(tokensInEther); // Round up: 9692 WISH

    // Convert to wei using BigInt (simple multiplication, no fractional parts)
    const amountInWei = BigInt(tokensRounded) * BigInt(10 ** decimals);

    // Return amount in WEI (smallest unit)
    return toTokens(amountInWei, decimals);
  } catch (error) {
    console.error("Error fetching WISH price:", error);
    // Fallback: ~12.5 WISH at $0.000004 per WISH
    const fallback = "12500000000000000000";
    console.log("Using fallback WISH amount:", fallback);
    return fallback;
  }
}

/**
 * Sweep entire token balance from server wallet to personal wallet
 * This runs after the x402 payment is received
 * Includes retry logic to wait for payment to settle on-chain
 */
async function sweepTokenBalance(tokenAddress: string) {
  try {
    // Check if it's native token (ETH) or ERC20
    const isNativeToken =
      tokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ||
      tokenAddress === "0x0000000000000000000000000000000000000000";

    if (isNativeToken) {
      console.log("Native token sweep - skipping for now");
      return;
    }

    // Wait a bit for the x402 payment to settle on-chain
    // Then check balance with retry logic
    let balance: string | undefined;
    const maxRetries = 5;
    const delayMs = 2000; // 2 seconds between retries

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Checking balance (attempt ${attempt}/${maxRetries})...`);

      // Wait before checking (except first attempt)
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      const balanceResult = await thirdwebReadContract(
        [
          {
            contractAddress: tokenAddress,
            method: "function balanceOf(address owner) view returns (uint256)",
            params: [SERVER_WALLET],
          },
        ],
        base.id,
      );

      // Extract balance - check both .result and .data fields
      balance =
        (balanceResult.result[0].result as string) ||
        (balanceResult.result[0].data as string);

      console.log(`Server wallet balance (attempt ${attempt}):`, balance);

      // If we have a balance > 0, break out of retry loop
      if (balance && balance !== "0") {
        break;
      }
    }

    // If balance is still 0 or undefined after retries, nothing to sweep
    if (!balance || balance === "0") {
      console.log("No balance to sweep after retries");
      return;
    }

    // Transfer the entire balance
    console.log(
      `Sweeping entire balance (${balance}) of token ${tokenAddress} to ${multisig[base.id]}`,
    );

    const result = await thirdwebWriteContract(
      [
        {
          contractAddress: tokenAddress,
          method:
            "function transfer(address to, uint256 amount) returns (bool)",
          params: [multisig[base.id], balance],
        },
      ],
      base.id,
      SERVER_WALLET, // From server wallet
    );

    console.log("Balance swept successfully:", result.result.transactionIds);
    return result;
  } catch (error) {
    console.error("Failed to sweep balance:", error);
    // Don't throw - we don't want to fail the main request if sweeping fails
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const walletAddress = await requireAuth(request);

    // Get payment data from headers
    const paymentData = request.headers.get("x-payment");

    // Parse request body
    const body = await request.json();
    const { item } = body;

    if (!item || !item.id) {
      return NextResponse.json(
        { error: "Item data is required" },
        { status: 400 },
      );
    }

    // CACHE CHECK: Check Redis for cached results BEFORE taking payment
    // If we have cached results, return immediately (no payment required)
    const cacheKey = `price-comparison:${item.id}:${walletAddress.toLowerCase()}`;

    if (redis) {
      try {
        const cachedResults = await redis.get(cacheKey);
        if (cachedResults) {
          console.log(
            "✅ Redis cache hit - returning cached results (no payment)",
          );
          return NextResponse.json({
            success: true,
            results: cachedResults,
            cached: true,
          });
        }
        console.log("Redis cache miss - will check availability and charge");
      } catch (error) {
        console.warn("Redis cache check failed, continuing:", error);
      }
    }

    // PRE-FLIGHT CHECK: Verify SerpAPI is available BEFORE taking payment
    // Always check fresh (no caching) to ensure accurate quota info
    console.log("Pre-flight: Checking SerpAPI availability...");
    const serpApiStatus = await checkSerpApiAvailability();

    if (!serpApiStatus.available) {
      console.error("❌ SerpAPI not available:", serpApiStatus.reason);
      // Return 503 Service Unavailable (don't trigger payment)
      return NextResponse.json(
        {
          error: "Price comparison service temporarily unavailable",
          details: serpApiStatus.reason,
          searchesLeft: serpApiStatus.searchesLeft,
        },
        { status: 503 },
      );
    }

    console.log(
      `✅ SerpAPI ready (${serpApiStatus.searchesLeft} searches remaining)`,
    );

    // Determine payment configuration based on toggle
    let paymentToken: `0x${string}`;
    let paymentAmount: string;
    let paymentDescription: string;

    if (USE_WISH_TOKEN) {
      // WISH token payment - calculate based on current price
      paymentAmount = await calculateWishPaymentAmount();
      paymentToken = WISH_TOKEN;
      paymentDescription = `Find the cheapest place to buy this item ($${TARGET_PRICE_USD} in WISH)`;
      console.log("Using WISH payment:", paymentAmount);
    } else {
      // USDC payment - fixed amount
      paymentAmount = USDC_AMOUNT;
      paymentToken = USDC_TOKEN;
      paymentDescription = `Find the cheapest place to buy this item ($${TARGET_PRICE_USD} USDC)`;
      console.log("Using USDC payment:", paymentAmount);
    }

    // PHASE 1: Verify and settle payment BEFORE doing expensive work
    // This prevents wasting resources on invalid/insufficient payments
    const verificationResult = await settlePayment({
      resourceUrl: request.url,
      method: "POST",
      paymentData,
      payTo: SERVER_WALLET,
      network: base,
      price: {
        amount: paymentAmount,
        asset: {
          address: paymentToken,
          decimals: USE_WISH_TOKEN ? 18 : 6,
        },
      },
      facilitator: x402Facilitator,
      routeConfig: {
        description: paymentDescription,
        mimeType: "application/json",
        maxTimeoutSeconds: 300,
      },
    });

    // If payment verification failed, return immediately
    // Status 402 = payment required (no payment data or invalid)
    // Other non-200 status = payment error
    if (verificationResult.status !== 200) {
      console.log("Payment verification failed:", verificationResult.status);
      return NextResponse.json(verificationResult.responseBody, {
        status: verificationResult.status,
        headers: verificationResult.responseHeaders,
      });
    }

    console.log("Payment verified and settled successfully for item:", item.id);
    console.log(
      "Payment receipt:",
      JSON.stringify(verificationResult.paymentReceipt, null, 2),
    );

    // Log payment receipt
    const tokenName = USE_WISH_TOKEN ? "WISH" : "USDC";
    const tokenDecimals = USE_WISH_TOKEN ? 18 : 6;

    console.log(`Payment received in ${tokenName}:`, {
      transactionId: verificationResult.paymentReceipt?.transaction,
      network: verificationResult.paymentReceipt?.network,
      payer: verificationResult.paymentReceipt?.payer,
      token: paymentToken,
      amount: paymentAmount,
      readableAmount: `${Number(paymentAmount) / 10 ** tokenDecimals} ${tokenName}`,
      usdValue: `$${TARGET_PRICE_USD}`,
    });

    // PHASE 2: Payment successful - now do the expensive work
    console.log("Payment verified - executing price comparison");

    // Parse item price - handle both regular prices and blockchain wei format
    let itemPrice: number | undefined;
    if (item.price) {
      console.log("Item price:", item.price);
      const parsed = toEther(item.price);
      // If price is unreasonably large (likely wei format), ignore it
      if (!isNaN(Number(parsed)) && Number(parsed) > 0) {
        itemPrice = Number(parsed);
      }
    }
    console.log("Original item price:", itemPrice || "not provided");

    // Extract product info and search Google Shopping directly
    const productInfo = extractProductInfo({
      title: item.title,
      url: item.url,
      description: item.description || "",
    });

    // Search Google Shopping using direct SerpAPI
    let comparisonResults;
    try {
      comparisonResults = await searchGoogleShopping(productInfo, itemPrice);
      console.log(
        `Found ${comparisonResults.stores.length} stores, cheapest: $${comparisonResults.cheapestPrice}`,
      );

      // Verify we have actual results
      if (!comparisonResults.stores || comparisonResults.stores.length === 0) {
        throw new Error("No stores found with valid URLs and prices");
      }
    } catch (error) {
      console.error("Google Shopping search failed:", error);

      // Cache the failure in Redis (1 hour) so user doesn't pay again immediately
      if (redis) {
        try {
          const failureResult = {
            cheapestPrice: 0,
            stores: [],
            comparedAt: new Date().toISOString(),
            error: error instanceof Error ? error.message : "Search failed",
          };
          await redis.set(cacheKey, failureResult, { ex: CACHE_TTL.ONE_HOUR });
          console.log("Cached failure in Redis (1 hour TTL)");
        } catch (cacheError) {
          console.error("Failed to cache error in Redis:", cacheError);
        }
      }

      return NextResponse.json(
        {
          error: "Failed to find prices",
          details:
            error instanceof Error ? error.message : "Price search failed",
          note: "We've cached this failure. Try again in 1 hour.",
        },
        { status: 500 },
      );
    }

    // Cache successful results in Redis (1 hour TTL)
    if (redis) {
      try {
        await redis.set(cacheKey, comparisonResults, {
          ex: CACHE_TTL.ONE_HOUR,
        });
        console.log(
          `✅ Cached results in Redis (1 hour TTL, ${comparisonResults.stores.length} stores)`,
        );
      } catch (error) {
        console.error("Failed to cache results in Redis:", error);
        // Don't fail the request if caching fails
      }
    } else {
      console.warn("⚠️ Redis not configured - results will not be cached");
    }

    // PHASE 3: Sweep entire token balance to personal wallet
    // This happens in the background after the main work is done
    console.log(`Sweeping entire ${tokenName} balance to personal wallet`);
    sweepTokenBalance(paymentToken).catch((error: Error) => {
      console.error("Background balance sweep failed:", error);
    });

    return NextResponse.json({
      success: true,
      results: comparisonResults,
      cached: false,
    });
  } catch (error) {
    console.error("Error in find-cheapest endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to find cheapest prices",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
