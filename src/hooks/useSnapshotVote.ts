"use client";

import snapshot from "@snapshot-labs/snapshot.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActiveAccount } from "thirdweb/react";
import type { Account } from "thirdweb/wallets";

import {
  chain,
  snapshotAppId,
  snapshotHubUrl,
  snapshotSpaceId,
} from "@/constants";
import type { SnapshotVotePayload } from "@/lib/snapshot";
import { supportedVoteTypes } from "@/lib/snapshot";

const snapshotClient = new snapshot.Client712(snapshotHubUrl);

type Domain = Record<string, unknown>;
type Message = Record<string, unknown>;
type Types = Record<string, { name: string; type: string }[]>;

function createDomainDefinition(domain: Domain) {
  return Object.entries(domain).map(([name, value]) => {
    switch (name) {
      case "chainId":
        return { name, type: "uint256" };
      case "verifyingContract":
        return { name, type: "address" };
      case "salt":
        return { name, type: "bytes32" };
      default:
        return {
          name,
          type: typeof value === "number" ? "uint256" : "string",
        };
    }
  });
}

function createSnapshotSigner(account: Account) {
  return {
    provider: {
      async getNetwork() {
        return { chainId: chain.id };
      },
    },
    async _signTypedData(domain: Domain, types: Types, message: Message) {
      return account.signTypedData({
        domain,
        types: {
          ...types,
          EIP712Domain: createDomainDefinition(domain),
        } as Types & {
          EIP712Domain: { name: string; type: string }[];
        },
        message,
        primaryType: "Vote",
      });
    },
  };
}

type SnapshotVoteInput = SnapshotVotePayload & {
  reason?: string;
};

export function useSnapshotVote() {
  const account = useActiveAccount();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["snapshot", "vote"],
    mutationFn: async ({ proposalId, space, type, choice, reason }: SnapshotVoteInput) => {
      if (!account) {
        throw new Error("You need to connect a wallet to vote.");
      }

      if (!supportedVoteTypes.has(type)) {
        throw new Error("This proposal uses a voting type that isn't supported yet.");
      }

      const signer = createSnapshotSigner(account);

      await snapshotClient.vote(
        signer as unknown as object,
        account.address,
        {
          space,
          proposal: proposalId,
          type,
          choice,
          reason: reason ?? "",
          app: snapshotAppId,
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["snapshot", "proposals", snapshotSpaceId],
      });
    },
  });
}
