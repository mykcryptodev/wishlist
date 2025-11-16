"use client";

import { useQuery } from "@tanstack/react-query";
import { getContract, toEther } from "thirdweb";

import { chain, stake as stakeAddress } from "@/constants";
import { getBurnInfo } from "@/constants/contracts/stake";
import { client } from "@/providers/Thirdweb";

/**
 * Hook to get detailed burn information for a user
 * @param address - The user's wallet address
 * @returns Query result with burn info including timeStaked, completePeriods, etc.
 */
export function useBurnInfo(address?: string) {
  return useQuery({
    queryKey: ["burnInfo", chain.id, address],
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const stakeContract = getContract({
        client,
        chain,
        address: stakeAddress[chain.id],
      });

      const result = await getBurnInfo({
        contract: stakeContract,
        staker: address,
      });

      return {
        currentStaked: result[0],
        currentStakedFormatted: toEther(result[0]),
        timeStaked: result[1],
        completePeriods: result[2],
        totalBurnable: result[3],
        totalBurnableFormatted: toEther(result[3]),
        alreadyBurned: result[4],
        alreadyBurnedFormatted: toEther(result[4]),
        availableToBurn: result[5],
        availableToBurnFormatted: toEther(result[5]),
      };
    },
    enabled: !!address,
    refetchInterval: 1000, // Refetch every second for countdown timer
    staleTime: 0,
  });
}
