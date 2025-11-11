import type { Metadata } from "next";

import { SnapshotProposalDetail } from "@/components/snapshot/snapshot-proposal-detail";

export const metadata: Metadata = {
  title: "Proposal | Wishlist Governance",
  description: "View proposal details and cast your vote on Snapshot.",
};

interface ProposalPageProps {
  params: Promise<{ proposalId: string }>;
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const { proposalId } = await params;
  return <SnapshotProposalDetail proposalId={proposalId} />;
}
