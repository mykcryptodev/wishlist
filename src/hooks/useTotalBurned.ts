"use client";

import { useQuery } from "@tanstack/react-query";
import { getContract } from "thirdweb";
import { toEther } from "thirdweb/utils";

import { chain, stake as stakeAddress } from "@/constants";
import { getTotalBurnedAllTime } from "@/constants/contracts/stake";
import { client } from "@/providers/Thirdweb";

export function useTotalBurned() {
  return useQuery({
    queryKey: ["totalBurned", chain.id],
    queryFn: async () => {
      const stakeContract = getContract({
        client,
        chain,
        address: stakeAddress[chain.id],
      });

      try {
        const totalBurned = await getTotalBurnedAllTime({
          contract: stakeContract,
        });

        const totalBurnedFormatted = toEther(totalBurned);

        return {
          totalBurned,
          totalBurnedFormatted,
        };
      } catch (error) {
        console.error("Error fetching total burned:", error);
        throw error;
      }
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}
