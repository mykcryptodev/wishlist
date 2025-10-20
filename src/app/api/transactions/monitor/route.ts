import { NextRequest, NextResponse } from "next/server";

import { getTransactionStatus } from "@/lib/thirdweb-http-api";

/**
 * Transaction status mapping for client consumption
 */
type ClientTransactionStatus = "pending" | "success" | "failed" | "cancelled";

/**
 * Monitor transaction endpoint
 *
 * GET /api/transactions/monitor?transactionId=<id>
 *
 * Retrieves the current status of a transaction from the Thirdweb API.
 * Maps the Thirdweb status to a simplified client-friendly status.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get("transactionId");

    if (!transactionId) {
      return NextResponse.json(
        { error: "Missing transactionId parameter" },
        { status: 400 },
      );
    }

    // Get transaction status from Thirdweb API
    const transactionData = await getTransactionStatus(transactionId);

    // Determine transaction status
    let status: ClientTransactionStatus = "pending";
    let error: string | null = null;

    // Map Thirdweb status to client status
    // Thirdweb returns the data wrapped in a result object
    const txStatus = transactionData.result.status;
    const onchainStatus = transactionData.result.executionResult?.onchainStatus;

    if (txStatus === "CONFIRMED") {
      // Check if the transaction was actually successful on-chain
      if (onchainStatus === "FAILED") {
        status = "failed";
        error =
          transactionData.result.errorMessage || "Transaction failed on-chain";
      } else {
        status = "success";
      }
    } else if (txStatus === "CANCELLED") {
      status = "cancelled";
      error = "Transaction was cancelled";
    } else if (transactionData.result.errorMessage) {
      status = "failed";
      error = transactionData.result.errorMessage;
    }

    return NextResponse.json({
      success: true,
      transactionId,
      status,
      error,
      data: transactionData,
    });
  } catch (error) {
    console.error("Error monitoring transaction:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to monitor transaction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
