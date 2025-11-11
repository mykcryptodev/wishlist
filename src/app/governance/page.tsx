import type { Metadata } from "next";

import { SnapshotGovernanceView } from "@/components/snapshot/snapshot-governance";

export const metadata: Metadata = {
  title: "Wishlist Governance",
  description:
    "Browse Snapshot proposals and cast votes for the Wishlist community directly from the app.",
};

export default function GovernancePage() {
  return <SnapshotGovernanceView />;
}
