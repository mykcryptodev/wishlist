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
import { settlePayment } from "thirdweb/x402";
import { base } from "thirdweb/chains";

import { requireAuth } from "@/lib/auth-utils";
import { supabaseAdmin } from "@/lib/supabase";
import { x402Facilitator } from "@/lib/x402-facilitator";

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

    // PHASE 1: Verify and settle payment BEFORE doing expensive work
    // This prevents wasting resources on invalid/insufficient payments
    const verificationResult = await settlePayment({
      resourceUrl: request.url,
      method: "POST",
      paymentData,
      payTo: process.env.THIRDWEB_PROJECT_WALLET!,
      network: base,
      price: "$0.05", // $0.05 USD price
      facilitator: x402Facilitator,
      routeConfig: {
        description: "Find the cheapest place to buy this item",
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

    // PHASE 2: Payment successful - now do the expensive work
    // Check if we already have cached results for this user/item
    const { data: existingComparison } = await supabaseAdmin
      .from("price_comparisons")
      .select("*")
      .eq("item_id", item.id)
      .eq("wallet_address", walletAddress.toLowerCase())
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingComparison) {
      console.log("Returning cached price comparison results");
      return NextResponse.json({
        success: true,
        results: existingComparison.results,
        cached: true,
      });
    }

    // DUMMY RESPONSE - Replace with actual price comparison logic later
    // This is where the expensive API calls or web scraping would happen
    console.log("Generating new price comparison results");

    const itemPrice = parseFloat(item.price) || 100;

    const dummyResults = {
      cheapestPrice: itemPrice * 0.85,
      stores: [
        {
          name: "Amazon",
          price: itemPrice * 0.85,
          url: item.url,
          savings: itemPrice * 0.15,
        },
        {
          name: "Walmart",
          price: itemPrice * 0.92,
          url: item.url,
          savings: itemPrice * 0.08,
        },
        {
          name: "Target",
          price: itemPrice * 0.95,
          url: item.url,
          savings: itemPrice * 0.05,
        },
      ],
      comparedAt: new Date().toISOString(),
    };

    // Save results to Supabase for caching
    const { error: insertError } = await supabaseAdmin
      .from("price_comparisons")
      .insert({
        item_id: item.id,
        wallet_address: walletAddress.toLowerCase(),
        item_data: item,
        results: dummyResults,
      });

    if (insertError) {
      console.error("Failed to cache results:", insertError);
      // Don't fail the request if caching fails
    }

    return NextResponse.json({
      success: true,
      results: dummyResults,
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
