"use client";

import { useQuery } from "@tanstack/react-query";

import { BurnerTotal } from "@/lib/ponder";

async function fetchLeaderboardFromAPI(limit: number): Promise<BurnerTotal[]> {
  const res = await fetch(`/api/burn-leaderboard?limit=${limit}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch leaderboard");
  }

  return res.json();
}

export function useBurnLeaderboard(limit: number = 100) {
  return useQuery<BurnerTotal[]>({
    queryKey: ["burnLeaderboard", limit],
    queryFn: () => fetchLeaderboardFromAPI(limit),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });
}
