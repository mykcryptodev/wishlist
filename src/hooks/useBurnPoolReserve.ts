"use client";

import { useQuery } from "@tanstack/react-query";
import { getContract } from "thirdweb";
import { toEther } from "thirdweb/utils";

import { chain, stake as stakeAddress } from "@/constants";
import { burnPoolReserve } from "@/constants/contracts/stake";
import { client } from "@/providers/Thirdweb";

export function useBurnPoolReserve() {
  return useQuery({
    queryKey: ["burnPoolReserve", chain.id],
    queryFn: async () => {
      const stakeContract = getContract({
        client,
        chain,
        address: stakeAddress[chain.id],
      });

      try {
        const reserve = await burnPoolReserve({
          contract: stakeContract,
        });

        const reserveFormatted = toEther(reserve);

        return {
          reserve,
          reserveFormatted,
        };
      } catch (error) {
        console.error("Error fetching burn pool reserve:", error);
        throw error;
      }
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}

