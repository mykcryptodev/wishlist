/**
 * Hook for finding cheapest prices using x402-gated API
 *
 * Uses React Query for state management and caching
 * Integrates with Thirdweb's x402 payment flow
 */

import { useMutation } from "@tanstack/react-query";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { wrapFetchWithPayment } from "thirdweb/x402";

import { client } from "@/providers/Thirdweb";

import { useAuthToken } from "./useAuthToken";

export interface PriceComparisonResults {
  cheapestPrice: number;
  stores: Array<{
    name: string;
    price: number;
    url: string;
    savings: number;
    source: string;
    thumbnail?: string;
    shipping?: string;
    rating?: number;
    installment?: {
      monthlyPrice: number;
      months: number;
    };
  }>;
  comparedAt: string;
}

export interface FindCheapestResult {
  success: true;
  results: PriceComparisonResults;
  cached: boolean;
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
  const wallet = useActiveWallet();
  const { token } = useAuthToken();

  const mutation = useMutation({
    mutationKey: ["findCheapestPrice"],
    mutationFn: async (item: WishlistItem): Promise<FindCheapestResult> => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      if (!wallet) {
        throw new Error("No active wallet found");
      }

      if (!token) {
        throw new Error("Not authenticated. Please sign in.");
      }

      // Wrap fetch with x402 payment handling
      // This will automatically prompt for payment if 402 is returned
      // Set maxValue high enough for WISH token payments
      // 10,000 WISH in wei = 10,000 * 10^18
      const MAX_WISH_PAYMENT = BigInt(10000) * BigInt(10 ** 18);
      // Cast through unknown to satisfy differing wrapFetchWithPayment typings
      const maxPaymentConfig = {
        maxValue: MAX_WISH_PAYMENT,
      } as unknown as Parameters<typeof wrapFetchWithPayment>[3];

      const fetchWithPay = wrapFetchWithPayment(
        fetch,
        client,
        wallet,
        maxPaymentConfig,
      );

      // Make request to x402 endpoint with payment wrapper
      const response = await fetchWithPay("/api/wishlist/find-cheapest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ item }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to find cheapest prices");
      }

      const data = await response.json();

      // Success - return results
      return {
        success: true,
        results: data.results,
        cached: data.cached || false,
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
