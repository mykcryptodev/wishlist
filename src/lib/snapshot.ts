import { snapshotApiUrl, snapshotSpaceId } from "@/constants";

export type SnapshotProposal = {
  id: string;
  title: string;
  body: string;
  state: string;
  author: string;
  start: number;
  end: number;
  snapshot: string;
  link: string;
  choices: string[];
  type: string;
  votes: number;
  quorum: number;
  scores: number[];
  scores_total: number;
  strategies: { name: string }[];
  space: {
    id: string;
    name?: string | null;
  };
};

export type SnapshotVotePayload = {
  proposalId: string;
  space: string;
  type: string;
  choice: number | number[] | string;
  reason?: string;
};

const PROPOSALS_QUERY = `
  query Proposals($space: String!, $limit: Int!) {
    proposals(
      first: $limit
      where: { space_in: [$space] }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      title
      body
      state
      author
      start
      end
      snapshot
      link
      choices
      type
      votes
      quorum
      scores
      scores_total
      strategies {
        name
      }
      space {
        id
        name
      }
    }
  }
`;

export async function fetchSnapshotProposals({
  first = 20,
}: { first?: number } = {}): Promise<SnapshotProposal[]> {
  const response = await fetch(snapshotApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: PROPOSALS_QUERY,
      variables: {
        space: snapshotSpaceId,
        limit: first,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Snapshot API responded with ${response.status}`);
  }

  const result = (await response.json()) as {
    data?: { proposals: SnapshotProposal[] };
    errors?: { message?: string }[];
  };

  if (result.errors?.length) {
    throw new Error(result.errors[0]?.message ?? "Unable to load proposals");
  }

  if (!result.data) {
    throw new Error("Snapshot API did not return data");
  }

  return result.data.proposals;
}

export const supportedVoteTypes = new Set(["single-choice", "basic"]);

export function getSnapshotProposalUrl(proposal: SnapshotProposal): string {
  if (proposal.link) {
    return proposal.link;
  }

  const spaceSlug = proposal.space.id.includes(":")
    ? proposal.space.id
    : `s:${proposal.space.id}`;

  return `https://snapshot.box/#/${spaceSlug}/proposal/${proposal.id}`;
}

export const SNAPSHOT_PROPOSAL_QUERY_LIMIT = 20;
