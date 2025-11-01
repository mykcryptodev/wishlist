"use client";

import { useQuery } from "@tanstack/react-query";
import { getContract, toEther } from "thirdweb";

import { chain, stake as stakeAddress } from "@/constants";
import { getBurnableAmount } from "@/constants/contracts/stake";
import { client } from "@/providers/Thirdweb";

/**
 * Hook to get the burnable amount for a user
 * @param address - The user's wallet address
 * @returns Query result with burnable amount
 */
export function useBurnableAmount(address?: string) {
  return useQuery({
    queryKey: ["burnableAmount", chain.id, address],
    queryFn: async () => {
      if (!address) {
        return {
          burnable: BigInt(0),
          burnableFormatted: "0",
        };
      }

      const stakeContract = getContract({
        client,
        chain,
        address: stakeAddress[chain.id],
      });

      const burnable = await getBurnableAmount({
        contract: stakeContract,
        staker: address,
      });

      return {
        burnable,
        burnableFormatted: toEther(burnable),
      };
    },
    enabled: !!address,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000,
  });
}
