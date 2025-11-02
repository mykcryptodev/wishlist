/**
 * Example Payable API Endpoint using x402
 *
 * This is a demonstration endpoint that shows how to implement
 * x402 payments in your API routes.
 *
 * Usage:
 * - Without payment: Returns 402 Payment Required with payment details
 * - With payment: Returns premium content (200 OK)
 *
 * See docs/X402_PAYMENTS.md for full documentation.
 */

import { NextRequest, NextResponse } from "next/server";
import { settlePayment } from "thirdweb/x402";
import { base } from "thirdweb/chains";
import { x402Facilitator } from "@/lib/x402-facilitator";

export async function GET(request: NextRequest) {
  try {
    // Get payment data from request headers
    // This header is set by the client after making a payment
    const paymentData = request.headers.get("x-payment");

    // Settle the payment using Thirdweb's x402 facilitator
    const result = await settlePayment({
      resourceUrl: request.url,
      method: "GET",
      paymentData,
      payTo: process.env.THIRDWEB_PROJECT_WALLET!,
      network: base,
      price: "$0.01", // Price in USD (will be converted to appropriate token amount)
      facilitator: x402Facilitator,
      routeConfig: {
        description: "Access to premium API content example",
        mimeType: "application/json",
        maxTimeoutSeconds: 300, // 5 minutes to complete payment
      },
    });

    // If payment was successful (status 200), return premium content
    if (result.status === 200) {
      return NextResponse.json({
        success: true,
        data: {
          message: "Welcome to premium content!",
          content:
            "This is example premium content that requires payment to access.",
          timestamp: new Date().toISOString(),
          features: [
            "Unlimited API requests",
            "Priority support",
            "Advanced analytics",
            "Early access to new features",
          ],
        },
      });
    }

    // Otherwise, return the payment request (status 402)
    // This happens when:
    // 1. No payment data provided (first request)
    // 2. Payment verification failed
    return NextResponse.json(result.responseBody, {
      status: result.status,
      headers: result.responseHeaders,
    });
  } catch (error) {
    console.error("Error in premium endpoint:", error);
    return NextResponse.json(
      {
        error: "Failed to process premium request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
