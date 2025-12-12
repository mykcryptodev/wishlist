/**
 * Thirdweb HTTP API utility functions
 *
 * This module provides typed wrappers around the Thirdweb API for contract interactions.
 * Documentation: https://portal.thirdweb.com/connect/ecosystems/api-reference
 *
 * For multiple calls, uses Multicall3 contract directly via RPC to bypass API rate limits.
 */

import { type Address } from "viem";

import { chain } from "@/constants";
import { multicallReadContract } from "@/lib/multicall";

const THIRDWEB_API_URL = "https://api.thirdweb.com/v1";
const THIRDWEB_SECRET_KEY = process.env.THIRDWEB_SECRET_KEY!;
const PROJECT_WALLET = process.env.THIRDWEB_PROJECT_WALLET!;

if (!THIRDWEB_SECRET_KEY) {
  throw new Error("THIRDWEB_SECRET_KEY environment variable is required");
}

if (!PROJECT_WALLET) {
  throw new Error("THIRDWEB_PROJECT_WALLET environment variable is required");
}

/**
 * Contract call definition for read/write operations
 */
export interface ContractCall {
  contractAddress: string;
  method: string;
  params: unknown[];
  value?: string; // Optional value in wei for payable functions
}

/**
 * Response from a successful read contract call
 */
export interface ReadContractResult {
  data?: string;
  success: boolean;
  result?: unknown;
}

/**
 * Response from a successful write contract call
 */
export interface WriteContractResponse {
  result: {
    transactionIds: string[];
  };
}

/**
 * Full response wrapper from Thirdweb API
 */
export interface ThirdwebApiResponse<T> {
  result: T;
}

/**
 * Transaction status response from Thirdweb API
 * Note: This is the direct response, not wrapped in a result object
 */
export interface TransactionStatusResponse {
  id: string;
  status: "CONFIRMED" | "CANCELLED" | string;
  transactionHash?: string;
  errorMessage?: string | null;
  confirmedAt?: string;
  confirmedAtBlockNumber?: string;
  executionResult?: {
    status: "CONFIRMED" | string;
    onchainStatus?: "SUCCESS" | "FAILED";
    transactionHash?: string;
    receipt?: unknown;
  };
  createdAt?: string;
  cancelledAt?: string | null;
}

/**
 * Error response from Thirdweb API
 */
export interface ThirdwebApiError {
  correlationId?: string;
  message: string;
  code?: string;
}

/**
 * Write to a smart contract using the Thirdweb API
 *
 * @param calls - Array of contract calls to execute
 * @param chainId - The blockchain network ID (default: Base mainnet)
 * @param from - Optional wallet address to execute from (defaults to project wallet)
 * @returns Promise with transaction IDs
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const result = await thirdwebWriteContract([{
 *   contractAddress: "0x...",
 *   method: "function mint(address to, uint256 amount)",
 *   params: ["0xRecipient...", "1000000000000000000"]
 * }]);
 * console.log(result.result.transactionIds[0]);
 * ```
 */
export async function thirdwebWriteContract(
  calls: ContractCall[],
  chainId: number = chain.id,
  from?: string,
): Promise<WriteContractResponse> {
  try {
    const response = await fetch(`${THIRDWEB_API_URL}/contracts/write`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": THIRDWEB_SECRET_KEY,
      },
      body: JSON.stringify({
        calls,
        chainId,
        from: from || PROJECT_WALLET,
      }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData: ThirdwebApiError = await response.json();
        errorMessage = errorData.message || errorMessage;
        if (errorData.correlationId) {
          errorMessage += ` (ID: ${errorData.correlationId})`;
        }
      } catch {
        // If we can't parse error as JSON, use the text
        errorMessage = await response.text();
      }
      throw new Error(`Thirdweb API error: ${errorMessage}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected error calling Thirdweb API: ${String(error)}`);
  }
}

/**
 * Read from a smart contract using the Thirdweb API
 * For multiple calls, uses Multicall3 contract directly via RPC to bypass API rate limits
 *
 * @param calls - Array of contract calls to execute
 * @param chainId - The blockchain network ID (default: Base mainnet)
 * @returns Promise with call results
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const result = await thirdwebReadContract([{
 *   contractAddress: "0x...",
 *   method: "function balanceOf(address owner) view returns (uint256)",
 *   params: ["0xOwner..."]
 * }]);
 * const balance = result.result[0].data;
 * ```
 */
export async function thirdwebReadContract(
  calls: ContractCall[],
  chainId: number = chain.id,
): Promise<ThirdwebApiResponse<ReadContractResult[]>> {
  // Use multicall directly for multiple calls to bypass API rate limits
  if (calls.length > 1) {
    try {
      const results = await multicallReadContract(
        calls.map(call => ({
          contractAddress: call.contractAddress as Address,
          method: call.method,
          params: call.params,
        })),
        chainId,
      );

      // Convert multicall results to API format
      // The API returns both `data` (hex string) and `result` (decoded value)
      // Existing code uses: `result.data || result.result`
      const apiResults: ReadContractResult[] = results.map(decodedResult => {
        if (
          decodedResult === null ||
          (typeof decodedResult === "object" &&
            decodedResult !== null &&
            "__error" in decodedResult)
        ) {
          return { success: false };
        }

        // For boolean results, the API returns the boolean in `result` and hex in `data`
        // For other types, it returns the decoded value in `result` and hex in `data`
        // We need to get the raw hex data to match API format
        // Since we decoded it, we'll need to re-encode or return the decoded value

        // The existing code pattern `result.data || result.result` will work if we put
        // the decoded value in `result` field. For simple types like bool, this works.
        // For complex types (tuples), the decoded value is already an object/array.
        return {
          success: true,
          result: decodedResult,
          // Include data field for compatibility (though decoded result takes precedence)
          data:
            typeof decodedResult === "boolean"
              ? decodedResult
                ? "0x0000000000000000000000000000000000000000000000000000000000000001"
                : "0x0000000000000000000000000000000000000000000000000000000000000000"
              : undefined,
        };
      });

      // Check if too many results failed - if more than half failed, fall back to API
      const failedCount = apiResults.filter(r => !r.success).length;
      if (failedCount > 0 && failedCount >= calls.length / 2) {
        // More than half failed, likely a systemic issue - fall back to API
        console.warn(
          `${failedCount}/${calls.length} multicall decodings failed, falling back to Thirdweb API`,
        );
        throw new Error(
          `Too many multicall decodings failed: ${failedCount}/${calls.length}`,
        );
      }

      return { result: apiResults };
    } catch (error) {
      // Fallback to API if multicall fails or too many decodings fail
      console.warn(
        "Multicall failed, falling back to Thirdweb API:",
        error instanceof Error ? error.message : error,
      );
      // Continue to API fallback below
    }
  }

  // Single call or fallback: use API
  try {
    const response = await fetch(`${THIRDWEB_API_URL}/contracts/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": THIRDWEB_SECRET_KEY,
      },
      body: JSON.stringify({
        calls,
        chainId,
      }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData: ThirdwebApiError = await response.json();
        errorMessage = errorData.message || errorMessage;
        if (errorData.correlationId) {
          errorMessage += ` (ID: ${errorData.correlationId})`;
        }
      } catch {
        // If we can't parse error as JSON, use the text
        errorMessage = await response.text();
      }
      throw new Error(`Thirdweb API error: ${errorMessage}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected error calling Thirdweb API: ${String(error)}`);
  }
}

/**
 * Get the status of a transaction
 *
 * @param transactionId - The transaction ID returned from a write operation
 * @returns Promise with transaction status details wrapped in a result object
 * @throws Error if the API request fails
 *
 * @example
 * ```typescript
 * const response = await getTransactionStatus("tx_...");
 * if (response.result.status === "CONFIRMED") {
 *   console.log("Transaction confirmed!");
 * }
 * ```
 */
export async function getTransactionStatus(
  transactionId: string,
): Promise<ThirdwebApiResponse<TransactionStatusResponse>> {
  try {
    const response = await fetch(
      `${THIRDWEB_API_URL}/transactions/${transactionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-secret-key": THIRDWEB_SECRET_KEY,
        },
      },
    );

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData: ThirdwebApiError = await response.json();
        errorMessage = errorData.message || errorMessage;
        if (errorData.correlationId) {
          errorMessage += ` (ID: ${errorData.correlationId})`;
        }
      } catch {
        // If we can't parse error as JSON, use the text
        errorMessage = await response.text();
      }
      throw new Error(`Thirdweb API error: ${errorMessage}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected error calling Thirdweb API: ${String(error)}`);
  }
}
