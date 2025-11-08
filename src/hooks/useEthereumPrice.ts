import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

export interface EthereumPriceData {
  price: number;
  timestamp: number;
  source: "cache" | "coingecko" | "thirdweb";
}

export type PriceTrend = "up" | "down" | "neutral";

async function fetchEthereumPrice(): Promise<EthereumPriceData> {
  const response = await fetch("/api/ethereum-price");

  if (!response.ok) {
    throw new Error(`Failed to fetch Ethereum price: ${response.status}`);
  }

  return response.json();
}

export function useEthereumPrice() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["ethereum-price"],
    queryFn: fetchEthereumPrice,
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
    staleTime: 15 * 1000, // Data is fresh for 15 seconds
    retry: 3, // Retry failed requests 3 times
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  const previousPriceRef = useRef<number | undefined>(undefined);
  const [trend, setTrend] = useState<PriceTrend>("neutral");

  useEffect(() => {
    if (data?.price && previousPriceRef.current !== undefined) {
      const currentPrice = data.price;
      const previousPrice = previousPriceRef.current;

      if (currentPrice > previousPrice) {
        setTrend("up");
      } else if (currentPrice < previousPrice) {
        setTrend("down");
      } else {
        setTrend("neutral");
      }
    }

    if (data?.price) {
      previousPriceRef.current = data.price;
    }
  }, [data?.price]);

  return {
    price: data?.price,
    timestamp: data?.timestamp,
    source: data?.source,
    trend,
    loading: isLoading,
    error,
    refetch,
  };
}
