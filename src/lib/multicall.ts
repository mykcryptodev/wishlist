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

  // Extract return type - handle both single types and tuples
  // Tuples are wrapped in parentheses: returns ((uint256,address,...))
  // Single types: returns (bool) or returns (uint256)
  let returnType: string;
  const returnsMatch = methodSignature.match(/returns\s+(.+)$/);
  if (!returnsMatch) {
    throw new Error(`Could not parse return type from: ${methodSignature}`);
  }

  const returnsPart = returnsMatch[1].trim();

  // Check if it's a tuple (starts with double parentheses)
  if (returnsPart.startsWith("((")) {
    // Tuple return type - extract the inner tuple (without outer parentheses)
    // Find the matching closing parentheses for the inner tuple
    let depth = 0;
    let endIndex = -1;
    // Start from index 1 to skip the first opening parenthesis
    for (let i = 1; i < returnsPart.length; i++) {
      if (returnsPart[i] === "(") depth++;
      if (returnsPart[i] === ")") depth--;
      if (depth === 0) {
        // Found the matching closing parenthesis for the inner tuple
        endIndex = i + 1; // Position after the closing ')'
        break;
      }
    }
    if (endIndex === -1) {
      throw new Error(
        `Could not parse tuple return type from: ${methodSignature}`,
      );
    }
    // Extract inner tuple: from index 1 (after first '(') to endIndex (including the closing ')')
    // Example: "((uint256,...))" -> extract "(uint256,...)"
    returnType = returnsPart.substring(1, endIndex);
  } else {
    // Single return type - extract from parentheses
    const singleMatch = returnsPart.match(/\(([^)]+)\)/);
    if (!singleMatch) {
      throw new Error(`Could not parse return type from: ${methodSignature}`);
    }
    returnType = singleMatch[1].trim();
  }

  // Extract parameter types for ABI
  const paramTypes =
    methodSignature.match(/\(([^)]+)\)/)?.[1]?.split(",") || [];
  const inputTypes = paramTypes.map(p => p.trim().split(" ")[0]);

  // Create function ABI for decoding
  // Viem requires tuples to be specified with 'tuple' type and components array
  let abiParameter: { type: string; components?: Array<{ type: string }> };

  if (returnType.startsWith("(")) {
    // It's a tuple - parse the components
    const tupleContent = returnType.slice(1, -1); // Remove outer parentheses
    const components = tupleContent.split(",").map(c => ({
      type: c.trim(),
    }));

    abiParameter = {
      type: "tuple",
      components,
    };
  } else {
    // Simple type
    abiParameter = { type: returnType };
  }

  try {
    // Use decodeAbiParameters with proper tuple format
    const decoded = decodeAbiParameters([abiParameter], returnData);
    // decodeAbiParameters returns an array, get the first element
    return decoded[0];
  } catch (error) {
    // Fallback: try decodeFunctionResult with ABI
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
    } catch {
      // Final fallback: try to decode as raw value for simple types
      if (returnType === "bool" || returnType.trim() === "bool") {
        return BigInt(returnData) === BigInt(1);
      }
      throw error; // Throw the original decodeAbiParameters error
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
  const encodedCalls = calls.map(call =>
    encodeCall(call.contractAddress, call.method, call.params),
  );

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
