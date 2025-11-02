/**
 * Hook for finding cheapest prices using x402-gated API
 *
 * Uses React Query for state management and caching
 */

import { useMutation } from "@tanstack/react-query";
import { useActiveAccount } from "thirdweb/react";

import { useAuthToken } from "./useAuthToken";

export interface PriceComparisonResults {
  cheapestPrice: number;
  stores: Array<{
    name: string;
    price: number;
    url: string;
    savings: number;
  }>;
  comparedAt: string;
}

export interface FindCheapestResult {
  success?: boolean;
  needsPayment?: boolean;
  paymentData?: unknown;
  results?: PriceComparisonResults;
  cached?: boolean;
}

interface WishlistItem {
  id: string;
  owner: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  price: string;
  createdAt: string;
  updatedAt: string;
}

export function useFindCheapestPrice() {
  const account = useActiveAccount();
  const { token } = useAuthToken();

  const mutation = useMutation({
    mutationKey: ["findCheapestPrice"],
    mutationFn: async (item: WishlistItem): Promise<FindCheapestResult> => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      if (!token) {
        throw new Error("Not authenticated. Please sign in.");
      }

      // Make request to x402 endpoint
      const response = await fetch("/api/wishlist/find-cheapest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ item }),
      });

      const data = await response.json();

      if (response.status === 402) {
        // Payment required - return payment data
        return { needsPayment: true, paymentData: data };
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to find cheapest prices");
      }

      // Success - return results
      return {
        success: true,
        results: data.results,
        cached: data.cached,
      };
    },
    retry: false, // Don't retry payment requests
  });

  return {
    findCheapestPrice: mutation.mutate,
    findCheapestPriceAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    results: mutation.data?.results ?? null,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}
