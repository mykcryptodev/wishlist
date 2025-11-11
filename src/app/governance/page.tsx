import type { Metadata } from "next";

import { SnapshotProposalList } from "@/components/snapshot/snapshot-proposal-list";

export const metadata: Metadata = {
  title: "Wishlist Governance",
  description:
    "Browse Snapshot proposals and cast votes for the Wishlist community directly from the app.",
};

export default function GovernancePage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-outlined mt-4">
          Wishlist Governance
        </h1>
        <p className="mt-3 text-muted-foreground">
          Participate in community decisions without leaving Wishlist. Browse
          current proposals and cast your vote directly on Snapshot.
        </p>
      </div>
      <div className="mx-auto max-w-4xl">
        <SnapshotProposalList />
      </div>
    </div>
  );
}
