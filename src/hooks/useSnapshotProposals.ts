"use client";

import { useQuery } from "@tanstack/react-query";

import { snapshotSpaceId } from "@/constants";
import type { SnapshotProposal } from "@/lib/snapshot";
import { fetchSnapshotProposals, SNAPSHOT_PROPOSAL_QUERY_LIMIT } from "@/lib/snapshot";

export function useSnapshotProposals() {
  return useQuery<SnapshotProposal[]>({
    queryKey: ["snapshot", "proposals", snapshotSpaceId],
    queryFn: () =>
      fetchSnapshotProposals({ first: SNAPSHOT_PROPOSAL_QUERY_LIMIT }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
