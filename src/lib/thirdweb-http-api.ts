/**
 * Thirdweb HTTP API utility functions
 *
 * This module provides typed wrappers around the Thirdweb API for contract interactions.
 * Documentation: https://portal.thirdweb.com/connect/ecosystems/api-reference
 */

import { chain } from "@/constants";

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
