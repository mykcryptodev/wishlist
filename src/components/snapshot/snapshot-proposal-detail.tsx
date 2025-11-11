"use client";

import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useActiveAccount } from "thirdweb/react";

import { useSnapshotProposal } from "@/hooks/useSnapshotProposal";
import { useSnapshotVote } from "@/hooks/useSnapshotVote";
import type { SnapshotProposal } from "@/lib/snapshot";
import { getSnapshotProposalUrl, supportedVoteTypes } from "@/lib/snapshot";
import {
  dismissToast,
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "@/lib/toast";
import { cn } from "@/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Skeleton } from "../ui/skeleton";

const stateStyles: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  active: { label: "Active", variant: "default" },
  pending: { label: "Pending", variant: "secondary" },
  closed: { label: "Closed", variant: "outline" },
};

function formatDateTime(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatRelativeTime(timestamp: number) {
  if (typeof Intl === "undefined" || !Intl.RelativeTimeFormat) {
    return formatDateTime(timestamp);
  }

  const now = Date.now();
  const diff = timestamp * 1000 - now;
  const absDiff = Math.abs(diff);
  const units: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
    { unit: "day", ms: 86_400_000 },
    { unit: "hour", ms: 3_600_000 },
    { unit: "minute", ms: 60_000 },
  ];
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  for (const { unit, ms } of units) {
    if (absDiff >= ms || unit === "minute") {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }

  return rtf.format(0, "minute");
}

function describeTiming(proposal: SnapshotProposal) {
  const endText = `${formatRelativeTime(proposal.end)} (${formatDateTime(proposal.end)})`;
  const startText = `${formatRelativeTime(proposal.start)} (${formatDateTime(proposal.start)})`;

  switch (proposal.state) {
    case "pending":
      return `Voting opens ${startText}`;
    case "active":
      return `Voting ends ${endText}`;
    default:
      return `Voting closed ${endText}`;
  }
}

function formatPercent(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0%";
  }

  if (value < 1) {
    return `${value.toFixed(2)}%`;
  }

  return `${value.toFixed(1)}%`;
}

interface SnapshotProposalDetailProps {
  proposalId: string;
}

export function SnapshotProposalDetail({
  proposalId,
}: SnapshotProposalDetailProps) {
  const router = useRouter();
  const account = useActiveAccount();
  const {
    data: proposal,
    isLoading,
    isError,
    error,
    refetch,
  } = useSnapshotProposal(proposalId);
  const { mutateAsync: submitVote, isPending: isVoting } = useSnapshotVote();

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const handleVote = async () => {
    if (!proposal) {
      return;
    }

    if (!selectedChoice) {
      showErrorToast("Select an option before voting.");
      return;
    }

    const numericChoice = Number(selectedChoice);
    if (!Number.isFinite(numericChoice)) {
      showErrorToast("Select an option before voting.");
      return;
    }

    const toastId = showLoadingToast("Submitting your vote...");

    try {
      await submitVote({
        proposalId: proposal.id,
        space: proposal.space.id,
        type: proposal.type,
        choice: numericChoice,
      });
      showSuccessToast("Vote submitted", "Your vote was recorded on Snapshot.");
      setSelectedChoice(null);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Please try again in a moment.";
      showErrorToast("Unable to submit vote", message);
    } finally {
      dismissToast(toastId);
    }
  };

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Button
          className="mb-6"
          variant="ghost"
          onClick={() => router.push("/governance")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to proposals
        </Button>
        <Alert variant="destructive">
          <AlertTitle>Unable to load proposal</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Something went wrong while connecting to Snapshot."}
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/governance")}
              >
                Back to proposals
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Button
          className="mb-6"
          variant="ghost"
          onClick={() => router.push("/governance")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to proposals
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Button
          className="mb-6"
          variant="ghost"
          onClick={() => router.push("/governance")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to proposals
        </Button>
        <Alert>
          <AlertTitle>Proposal not found</AlertTitle>
          <AlertDescription>
            The proposal you&apos;re looking for doesn&apos;t exist or has been
            removed.
            <div className="mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/governance")}
              >
                Back to proposals
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const state = stateStyles[proposal.state] ?? {
    label: proposal.state,
    variant: "outline" as const,
  };

  const votingSupported = supportedVoteTypes.has(proposal.type);
  const isActive = proposal.state === "active";
  const hasVotes = proposal.scores_total > 0;

  return (
    <div className="container mx-auto px-4 py-10">
      <Button
        className="mb-6"
        variant="ghost"
        onClick={() => router.push("/governance")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to proposals
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={state.variant}>{state.label}</Badge>
              <span className="text-sm font-medium text-muted-foreground">
                {proposal.space.name ?? proposal.space.id}
              </span>
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold">
                {proposal.title}
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                {describeTiming(proposal)}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Snapshot #{proposal.snapshot}</span>
              <span aria-hidden className="text-muted-foreground">
                •
              </span>
              <span>Total votes: {proposal.votes.toLocaleString()}</span>
              {proposal.quorum > 0 && (
                <>
                  <span aria-hidden className="text-muted-foreground">
                    •
                  </span>
                  <span>Quorum target: {proposal.quorum}</span>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Proposal details
              </h3>
              <Button asChild size="sm" variant="outline">
                <Link href={getSnapshotProposalUrl(proposal)} target="_blank">
                  View on Snapshot
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {proposal.body || "No additional details were provided."}
            </ReactMarkdown>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Cast your vote
              </h3>
              {!votingSupported && (
                <p className="mt-1 text-sm text-muted-foreground">
                  This proposal uses a voting strategy that isn&apos;t supported
                  in-app yet. You can still cast your vote directly on Snapshot.
                </p>
              )}
              {!account && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Connect your wallet using the button in the header to
                  participate in voting.
                </p>
              )}
            </div>
            <RadioGroup
              className="space-y-3"
              value={selectedChoice ?? undefined}
              onValueChange={value => setSelectedChoice(value)}
            >
              {proposal.choices.map((choice: string, index: number) => {
                const value = String(index + 1);
                const score = proposal.scores[index] ?? 0;
                const percent = hasVotes
                  ? (score / proposal.scores_total) * 100
                  : 0;
                const isSelected = selectedChoice === value;

                return (
                  <div
                    key={value}
                    className={cn(
                      "rounded-xl border p-3 transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem
                          disabled={!isActive || !votingSupported || !account}
                          id={`choice-${value}`}
                          value={value}
                        />
                        <Label
                          className="cursor-pointer text-sm font-medium leading-tight"
                          htmlFor={`choice-${value}`}
                        >
                          {choice}
                        </Label>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground tabular-nums">
                        {formatPercent(percent)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                      <Progress value={percent} />
                      <span className="text-xs text-muted-foreground">
                        {score.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}{" "}
                        votes
                      </span>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                disabled={
                  !proposal ||
                  !selectedChoice ||
                  !account ||
                  !votingSupported ||
                  proposal.state !== "active" ||
                  isVoting
                }
                onClick={handleVote}
              >
                {isVoting ? "Submitting..." : "Submit vote"}
              </Button>
              {proposal.state !== "active" && (
                <span className="text-sm text-muted-foreground">
                  Voting is not currently open for this proposal.
                </span>
              )}
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
