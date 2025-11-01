import { useQuery } from "@tanstack/react-query";
import { getContract } from "thirdweb";

import { chain, stake } from "@/constants";
import { getRewardRatio, getTimeUnit } from "@/constants/contracts/stake";
import { client } from "@/providers/Thirdweb";

/**
 * Calculate APY from staking contract parameters
 * @param numerator - Reward ratio numerator
 * @param denominator - Reward ratio denominator
 * @param timeUnit - Time unit in seconds
 * @returns APY as a percentage
 */
function calculateAPY(
  numerator: bigint,
  denominator: bigint,
  timeUnit: bigint,
): number {
  if (denominator === BigInt(0)) return 0;

  // Calculate reward rate per time unit
  const rewardRatePerUnit = Number(numerator) / Number(denominator);

  // Calculate how many time units in a year
  const secondsPerYear = 365.25 * 24 * 60 * 60; // 31,557,600 seconds
  const periodsPerYear = secondsPerYear / Number(timeUnit);

  // APY calculation (simple interest, not compounded)
  // APY = (reward rate per period × periods per year) × 100
  const apy = rewardRatePerUnit * periodsPerYear * 100;

  return apy;
}

/**
 * Hook to fetch and calculate the current staking APY
 * @returns Object containing APY value, loading state, and error
 */
export function useStakingAPY() {
  return useQuery({
    queryKey: ["stakingAPY", chain.id],
    queryFn: async () => {
      // Get the staking contract
      const stakeContract = getContract({
        address: stake[chain.id],
        chain,
        client,
      });

      // Get reward parameters from contract
      const [rewardResult, timeUnitResult] = await Promise.all([
        getRewardRatio({
          contract: stakeContract,
        }),
        getTimeUnit({
          contract: stakeContract,
        }),
      ]);

      // Extract values from results
      const numerator = rewardResult[0];
      const denominator = rewardResult[1];
      const timeUnit = timeUnitResult;

      // Calculate APY
      const calculatedAPY = calculateAPY(numerator, denominator, timeUnit);
      return calculatedAPY;
    },
    staleTime: 1000 * 60 * 5, // APY is stable, cache for 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
