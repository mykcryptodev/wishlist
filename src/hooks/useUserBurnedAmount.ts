"use client";

import { useQuery } from "@tanstack/react-query";
import { getContract, readContract } from "thirdweb";
import { toEther } from "thirdweb/utils";

import { chain, stake as stakeAddress } from "@/constants";
import { client } from "@/providers/Thirdweb";

export function useUserBurnedAmount(userAddress?: string) {
  return useQuery({
    queryKey: ["userBurnedAmount", chain.id, userAddress],
    queryFn: async () => {
      if (!userAddress) {
        return {
          burnedAmount: BigInt(0),
          burnedAmountFormatted: "0",
        };
      }

      const stakeContract = getContract({
        client,
        chain,
        address: stakeAddress[chain.id],
      });

      try {
        // Read from the public burnedAmount mapping. This only tracks the
        // current burn session and is reset on compound/withdraw.
        const burnedAmount = await readContract({
          contract: stakeContract,
          method: "function burnedAmount(address) view returns (uint256)",
          params: [userAddress],
        });

        const burnedAmountFormatted = toEther(burnedAmount);

        return {
          burnedAmount,
          burnedAmountFormatted,
        };
      } catch (error) {
        console.error("Error fetching user burned amount:", error);
        throw error;
      }
    },
    enabled: !!userAddress,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}
