"use client";

import { useQuery } from "@tanstack/react-query";
import { getContract, readContract } from "thirdweb";
import { toEther } from "thirdweb/utils";

import { chain, stake as stakeAddress } from "@/constants";
import { client } from "@/providers/Thirdweb";

export function useUserRewardsClaimed(userAddress?: string) {
  return useQuery({
    queryKey: ["userRewardsClaimed", chain.id, userAddress],
    queryFn: async () => {
      if (!userAddress) {
        return {
          rewardsClaimed: BigInt(0),
          rewardsClaimedFormatted: "0",
        };
      }

      const stakeContract = getContract({
        client,
        chain,
        address: stakeAddress[chain.id],
      });

      try {
        // Read from the getUserTotalRewardsClaimed function
        const rewardsClaimed = await readContract({
          contract: stakeContract,
          method:
            "function getUserTotalRewardsClaimed(address) view returns (uint256)",
          params: [userAddress],
        });

        const rewardsClaimedFormatted = toEther(rewardsClaimed);

        return {
          rewardsClaimed,
          rewardsClaimedFormatted,
        };
      } catch (error) {
        console.error("Error fetching user rewards claimed:", error);
        throw error;
      }
    },
    enabled: !!userAddress,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}
