import { useQuery } from "@tanstack/react-query";

export interface EthereumPriceData {
  price: number;
  timestamp: number;
  source: "cache" | "coingecko" | "thirdweb";
}

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
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 30 * 1000, // Data is fresh for 30 seconds
    retry: 3, // Retry failed requests 3 times
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  return {
    price: data?.price,
    timestamp: data?.timestamp,
    source: data?.source,
    loading: isLoading,
    error,
    refetch,
  };
}
