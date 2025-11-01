"use client";

import { useQuery } from "@tanstack/react-query";
import { getContract, readContract, toEther } from "thirdweb";

import { chain, stake as stakeAddress } from "@/constants";
import { client } from "@/providers/Thirdweb";

const DAILY_BURN_CAP = 222_000_000; // 222M WISH per day

/**
 * Calculate the current day number (days since Unix epoch)
 */
const getCurrentDay = (): bigint => {
  const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  const day = Math.floor(now / (24 * 60 * 60)); // Days since epoch
  return BigInt(day);
};

/**
 * Hook to get the global daily burn progress
 * @returns Query result with daily burn data
 */
export function useDailyBurn() {
  return useQuery({
    queryKey: ["dailyBurn", chain.id],
    queryFn: async () => {
      const stakeContract = getContract({
        client,
        chain,
        address: stakeAddress[chain.id],
      });

      const currentDay = getCurrentDay();

      // Read dailyBurnedAmount mapping for current day
      const dailyBurnedWei = await readContract({
        contract: stakeContract,
        method: "function dailyBurnedAmount(uint256) view returns (uint256)",
        params: [currentDay],
      });

      const dailyBurnedFormatted = toEther(dailyBurnedWei);
      const dailyBurnedNumber = Number(dailyBurnedFormatted);

      // Calculate percentage of daily cap
      const percentageComplete = (dailyBurnedNumber / DAILY_BURN_CAP) * 100;

      // Calculate remaining
      const remaining = Math.max(DAILY_BURN_CAP - dailyBurnedNumber, 0);

      return {
        dailyBurnedWei,
        dailyBurned: dailyBurnedNumber,
        dailyBurnCap: DAILY_BURN_CAP,
        percentageComplete: Math.min(percentageComplete, 100),
        remaining,
        isCapReached: dailyBurnedNumber >= DAILY_BURN_CAP,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider stale after 15 seconds
  });
}
