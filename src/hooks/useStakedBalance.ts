"use client";

import { useQuery } from "@tanstack/react-query";
import { getContract, toEther } from "thirdweb";

import { chain, stake as stakeAddress } from "@/constants";
import { getStakeInfo } from "@/constants/contracts/stake";
import { client } from "@/providers/Thirdweb";

interface StakedBalanceData {
  tokensStaked: bigint;
  tokensStakedFormatted: string;
  rewards: bigint;
  rewardsFormatted: string;
}

export function useStakedBalance(address?: string) {
  return useQuery({
    queryKey: ["stakedBalance", chain.id, address],
    queryFn: async (): Promise<StakedBalanceData> => {
      if (!address) {
        return {
          tokensStaked: BigInt(0),
          tokensStakedFormatted: "0",
          rewards: BigInt(0),
          rewardsFormatted: "0",
        };
      }

      const stakeContract = getContract({
        client,
        chain,
        address: stakeAddress[chain.id],
      });

      const result = await getStakeInfo({
        contract: stakeContract,
        staker: address,
      });

      // result is [tokensStaked, rewards]
      const tokensStaked = result[0];
      const rewards = result[1];

      return {
        tokensStaked,
        tokensStakedFormatted: toEther(tokensStaked),
        rewards,
        rewardsFormatted: toEther(rewards),
      };
    },
    enabled: !!address,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
    placeholderData: previousData => previousData, // Keep previous data while refetching
  });
}
