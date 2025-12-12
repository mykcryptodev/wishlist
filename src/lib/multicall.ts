/**
 * Multicall utility for batching contract calls
 * Uses the Multicall3 contract directly via RPC to bypass API rate limits
 * Documentation: https://github.com/mds1/multicall
 */

import {
  type Address,
  createPublicClient,
  decodeAbiParameters,
  decodeFunctionResult,
  encodeFunctionData,
  http,
} from "viem";
import { base, baseSepolia } from "viem/chains";

import { chain, multicall as multicallAddress } from "@/constants";

/**
 * Encode a contract call
 */
function encodeCall(
  contractAddress: Address,
  methodSignature: string,
  params: unknown[],
): { target: Address; callData: `0x${string}` } {
  // Parse method signature (e.g., "function checkIsPurchaser(uint256,address) view returns (bool)")
  const methodName = methodSignature.match(/function\s+(\w+)/)?.[1];
  if (!methodName) {
    throw new Error(`Invalid method signature: ${methodSignature}`);
  }

  // Extract parameter types
  const paramTypes =
    methodSignature.match(/\(([^)]+)\)/)?.[1]?.split(",") || [];
  const types = paramTypes.map(p => p.trim().split(" ")[0]);

  // Create function ABI
  const abi = [
    {
      name: methodName,
      type: "function",
      inputs: types.map((type, i) => ({
        name: `param${i}`,
        type,
      })),
    },
  ] as const;

  // Encode function data
  const callData = encodeFunctionData({
    abi,
    functionName: methodName,
    args: params,
  });

  return {
    target: contractAddress,
    callData,
  };
}

/**
 * Decode contract call result
 */
function decodeResult(
  returnData: `0x${string}`,
  methodSignature: string,
): unknown {
  // Parse method signature to extract return type and function name
  const methodName = methodSignature.match(/function\s+(\w+)/)?.[1];
  if (!methodName) {
    throw new Error(`Could not parse method name from: ${methodSignature}`);
  }

  // Extract return type - handle both single types, tuples, and arrays of tuples
  // Tuples are wrapped in parentheses: returns ((uint256,address,...))
  // Arrays: returns ((uint256,address,...)[])
  // Single types: returns (bool) or returns (uint256)
  // Method signature may include modifiers like "external view" before returns
  let returnType: string;
  let isArray = false;

  // Match "returns" followed by the return type (handles "external view returns" etc.)
  const returnsMatch = methodSignature.match(/returns\s+(.+)$/i);
  if (!returnsMatch) {
    throw new Error(`Could not parse return type from: ${methodSignature}`);
  }

  let returnsPart = returnsMatch[1].trim();

  // Check if it's an array type (ends with [])
  if (returnsPart.endsWith("[]")) {
    isArray = true;
    returnsPart = returnsPart.slice(0, -2); // Remove "[]"
  }

  // Check if it's a tuple (starts with parentheses)
  if (returnsPart.startsWith("(")) {
    // Tuple return type - extract the tuple content
    // Handle both single tuple: (address,uint256,bool)
    // and wrapped tuple: ((address,uint256,bool))
    if (returnsPart.startsWith("((")) {
      // Double parentheses - find matching closing parens
      let depth = 0;
      let endIndex = -1;
      for (let i = 1; i < returnsPart.length; i++) {
        if (returnsPart[i] === "(") depth++;
        if (returnsPart[i] === ")") depth--;
        if (depth === 0) {
          endIndex = i + 1;
          break;
        }
      }
      if (endIndex === -1) {
        throw new Error(
          `Could not parse tuple return type from: ${methodSignature}`,
        );
      }
      returnType = returnsPart.substring(1, endIndex);
    } else {
      // Single parentheses - extract content
      returnType = returnsPart;
    }
  } else {
    // Single return type - extract from parentheses if present
    const singleMatch = returnsPart.match(/\(([^)]+)\)/);
    if (singleMatch) {
      returnType = singleMatch[1].trim();
    } else {
      returnType = returnsPart;
    }
  }

  // Extract parameter types for ABI
  const paramTypes =
    methodSignature.match(/\(([^)]+)\)/)?.[1]?.split(",") || [];
  const inputTypes = paramTypes.map(p => p.trim().split(" ")[0]);

  // Create function ABI for decoding
  // Viem requires tuples to be specified with 'tuple' type and components array
  let abiParameter: {
    type: string;
    components?: Array<{ type: string; name?: string }>;
  };

  if (returnType.startsWith("(")) {
    // It's a tuple - parse the components
    const tupleContent = returnType.slice(1, -1); // Remove outer parentheses

    // Parse tuple components, handling both named and unnamed formats
    // Examples:
    // - Named: "uint256 id, address owner, string title"
    // - Unnamed: "address, uint256, bool"
    // Split by comma, but be careful - we'll use a simple approach since Solidity
    // doesn't allow nested tuples in return types for our use cases
    const componentStrings = tupleContent.split(",").map(c => c.trim());

    const components = componentStrings.map(componentStr => {
      // Each component is either "type" or "type name"
      // Split by whitespace - the last token is the name (if present)
      const parts = componentStr.split(/\s+/).filter(p => p.length > 0);

      if (parts.length === 0) {
        throw new Error(`Invalid tuple component: "${componentStr}"`);
      }

      if (parts.length === 1) {
        // No name, just type: "uint256" or "address"
        return { type: parts[0].trim() };
      } else {
        // Has name: "uint256 id" -> type: "uint256", name: "id"
        // The last part is the name, everything else is the type
        // Handle multi-word types like "uint256" (single word) correctly
        const type = parts.slice(0, -1).join(" ").trim();
        const name = parts[parts.length - 1].trim();

        // Validate that type is not empty
        if (!type) {
          throw new Error(
            `Invalid tuple component - empty type: "${componentStr}"`,
          );
        }

        return { type, name };
      }
    });

    abiParameter = {
      type: isArray ? "tuple[]" : "tuple",
      components,
    };
  } else {
    // Simple type
    abiParameter = { type: isArray ? `${returnType}[]` : returnType };
  }

  // Try decodeFunctionResult first for tuples, as it handles function ABIs better
  // For simple types, decodeAbiParameters is fine
  const isTuple = returnType.startsWith("(");

  if (isTuple) {
    // For tuples, use decodeFunctionResult which handles function ABIs better
    try {
      const abi = [
        {
          name: methodName,
          type: "function",
          inputs: inputTypes.map((type, i) => ({
            name: `param${i}`,
            type,
          })),
          outputs: [abiParameter],
        },
      ] as const;

      const decoded = decodeFunctionResult({
        abi,
        functionName: methodName,
        data: returnData,
      });
      return decoded;
    } catch (error) {
      // Fallback to decodeAbiParameters
      try {
        const decoded = decodeAbiParameters([abiParameter], returnData);
        return decoded[0];
      } catch (fallbackError) {
        console.error(`Error decoding tuple result for ${methodName}:`, {
          decodeFunctionResult: error instanceof Error ? error.message : error,
          decodeAbiParameters:
            fallbackError instanceof Error
              ? fallbackError.message
              : fallbackError,
          returnType,
          abiParameter: JSON.stringify(abiParameter, null, 2),
        });
        throw error; // Throw the original error
      }
    }
  } else {
    // For simple types, use decodeAbiParameters
    try {
      const decoded = decodeAbiParameters([abiParameter], returnData);
      return decoded[0];
    } catch (error) {
      // Final fallback: try to decode as raw value for simple types
      if (returnType === "bool" || returnType.trim() === "bool") {
        return BigInt(returnData) === BigInt(1);
      }
      throw error;
    }
  }
}

/**
 * Execute multiple contract calls using Multicall3
 * @param calls - Array of contract calls to execute
 * @param chainId - The blockchain network ID
 * @returns Array of decoded results in the same order as input calls
 */
export async function multicallReadContract(
  calls: Array<{
    contractAddress: Address;
    method: string;
    params: unknown[];
  }>,
  chainId: number = chain.id,
): Promise<unknown[]> {
  // Get RPC URL
  const rpcUrl =
    chainId === base.id
      ? process.env.NEXT_PUBLIC_BASE_RPC_URL || base.rpcUrls.default.http[0]
      : chainId === baseSepolia.id
        ? baseSepolia.rpcUrls.default.http[0]
        : base.rpcUrls.default.http[0];

  // Create public client
  const publicClient = createPublicClient({
    chain: chainId === base.id ? base : baseSepolia,
    transport: http(rpcUrl),
  });

  // Get multicall address
  const multicall = multicallAddress[chainId] as Address;

  // Multicall3 ABI - aggregate function
  const MULTICALL_ABI = [
    {
      inputs: [
        {
          components: [
            { name: "target", type: "address" },
            { name: "callData", type: "bytes" },
          ],
          name: "calls",
          type: "tuple[]",
        },
      ],
      name: "aggregate",
      outputs: [
        { name: "blockNumber", type: "uint256" },
        { name: "returnData", type: "bytes[]" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ] as const;

  // Encode all calls
  // Convert BigInt params to strings/numbers for encoding
  const encodedCalls = calls.map(call => {
    const convertedParams = call.params.map(param => {
      if (typeof param === "bigint") {
        return param.toString();
      }
      return param;
    });
    return encodeCall(call.contractAddress, call.method, convertedParams);
  });

  // Execute multicall
  const result = await publicClient.readContract({
    address: multicall,
    abi: MULTICALL_ABI,
    functionName: "aggregate",
    args: [encodedCalls],
  });

  // Decode results
  const returnDataArray = result[1] as readonly `0x${string}`[];
  const decodedResults = returnDataArray.map(
    (returnData: `0x${string}`, index: number) => {
      // If call failed (empty return data), return null
      if (!returnData || returnData === "0x") {
        return null;
      }

      try {
        return decodeResult(returnData, calls[index].method);
      } catch (error) {
        console.error(
          `Error decoding result for call ${index} (method: ${calls[index].method}):`,
          error instanceof Error ? error.message : error,
        );
        // Return a special error marker instead of null so we can handle it
        return {
          __error: true,
          message: error instanceof Error ? error.message : String(error),
        };
      }
    },
  );

  return decodedResults;
}
