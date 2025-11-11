"use client";

import { useQuery } from "@tanstack/react-query";

import type { SnapshotProposal } from "@/lib/snapshot";
import { fetchSnapshotProposal } from "@/lib/snapshot";

export function useSnapshotProposal(proposalId: string) {
  return useQuery<SnapshotProposal | null>({
    queryKey: ["snapshot", "proposal", proposalId],
    queryFn: () => fetchSnapshotProposal(proposalId),
    staleTime: 30_000,
    refetchInterval: 60_000,
    enabled: !!proposalId,
  });
}
