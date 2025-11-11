"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useActiveAccount } from "thirdweb/react";

import { useSnapshotProposals } from "@/hooks/useSnapshotProposals";
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
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";

const stateStyles: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
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

export function SnapshotGovernanceView() {
  const account = useActiveAccount();
  const { data, isLoading, isError, error, refetch } = useSnapshotProposals();
  const { mutateAsync: submitVote, isPending: isVoting } = useSnapshotVote();

  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  useEffect(() => {
    if (!data?.length) {
      return;
    }

    setSelectedProposalId(prev => {
      if (prev && data.some(proposal => proposal.id === prev)) {
        return prev;
      }
      return data[0]?.id ?? null;
    });
  }, [data]);

  useEffect(() => {
    setSelectedChoice(null);
  }, [selectedProposalId]);

  const selectedProposal = useMemo(() => {
    if (!data || !data.length) {
      return null;
    }

    const match = data.find(proposal => proposal.id === selectedProposalId);
    return match ?? data[0] ?? null;
  }, [data, selectedProposalId]);

  const handleVote = async () => {
    if (!selectedProposal) {
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
        proposalId: selectedProposal.id,
        space: selectedProposal.space.id,
        type: selectedProposal.type,
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

  const renderProposalList = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={`proposal-skeleton-${index}`}
              className="h-20 w-full"
            />
          ))}
        </div>
      );
    }

    if (!data?.length) {
      return (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            No proposals found for this space yet.
          </CardContent>
        </Card>
      );
    }

    return (
      <ScrollArea className="max-h-[520px] pr-2">
        <div className="space-y-3">
          {data.map(proposal => {
            const state = stateStyles[proposal.state] ?? {
              label: proposal.state,
              variant: "outline" as const,
            };

            return (
              <button
                key={proposal.id}
                type="button"
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-all",
                  proposal.id === selectedProposal?.id
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-background hover:border-primary/50",
                )}
                onClick={() => setSelectedProposalId(proposal.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold leading-tight">
                      {proposal.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {describeTiming(proposal)}
                    </p>
                  </div>
                  <Badge variant={state.variant}>{state.label}</Badge>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  const renderProposalDetails = () => {
    if (isLoading) {
      return (
        <Card className="flex-1">
          <CardHeader>
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      );
    }

    if (!selectedProposal) {
      return (
        <Card className="flex-1">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Select a proposal to see more details.
          </CardContent>
        </Card>
      );
    }

    const state = stateStyles[selectedProposal.state] ?? {
      label: selectedProposal.state,
      variant: "outline" as const,
    };

    const votingSupported = supportedVoteTypes.has(selectedProposal.type);
    const isActive = selectedProposal.state === "active";
    const hasVotes = selectedProposal.scores_total > 0;

    return (
      <Card className="flex-1">
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={state.variant}>{state.label}</Badge>
              <span className="text-sm font-medium text-muted-foreground">
                {selectedProposal.space.name ?? selectedProposal.space.id}
              </span>
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold">
                {selectedProposal.title}
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                {describeTiming(selectedProposal)}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Snapshot #{selectedProposal.snapshot}</span>
              <span aria-hidden className="text-muted-foreground">•</span>
              <span>
                Total votes: {selectedProposal.votes.toLocaleString()}
              </span>
              {selectedProposal.quorum > 0 && (
                <>
                  <span aria-hidden className="text-muted-foreground">•</span>
                  <span>Quorum target: {selectedProposal.quorum}</span>
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
                <Link href={getSnapshotProposalUrl(selectedProposal)} target="_blank">
                  View on Snapshot
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <ScrollArea className="max-h-[320px] rounded-lg border p-4">
              <ReactMarkdown
                className="prose prose-sm max-w-none dark:prose-invert"
                remarkPlugins={[remarkGfm]}
              >
                {selectedProposal.body || "No additional details were provided."}
              </ReactMarkdown>
            </ScrollArea>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Cast your vote
              </h3>
              {!votingSupported && (
                <p className="mt-1 text-sm text-muted-foreground">
                  This proposal uses a voting strategy that isn&apos;t supported in-app yet.
                  You can still cast your vote directly on Snapshot.
                </p>
              )}
              {!account && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Connect your wallet using the button in the header to participate in voting.
                </p>
              )}
            </div>
            <RadioGroup
              className="space-y-3"
              value={selectedChoice ?? undefined}
              onValueChange={value => setSelectedChoice(value)}
            >
              {selectedProposal.choices.map((choice, index) => {
                const value = String(index + 1);
                const score = selectedProposal.scores[index] ?? 0;
                const percent = hasVotes
                  ? (score / selectedProposal.scores_total) * 100
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
                          disabled={!isActive || !votingSupported}
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
                  !selectedProposal ||
                  !selectedChoice ||
                  !account ||
                  !votingSupported ||
                  selectedProposal.state !== "active" ||
                  isVoting
                }
                onClick={handleVote}
              >
                {isVoting ? "Submitting..." : "Submit vote"}
              </Button>
              {selectedProposal.state !== "active" && (
                <span className="text-sm text-muted-foreground">
                  Voting is not currently open for this proposal.
                </span>
              )}
            </div>
          </section>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h1 className="text-3xl font-bold md:text-4xl">Wishlist Governance</h1>
        <p className="mt-3 text-muted-foreground">
          Participate in community decisions without leaving Wishlist. Browse current proposals and cast your vote directly on Snapshot.
        </p>
      </div>

      {isError && (
        <Alert className="mb-8" variant="destructive">
          <AlertTitle>Unable to load proposals</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Something went wrong while connecting to Snapshot."}
            <div className="mt-4">
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div>{renderProposalList()}</div>
        {renderProposalDetails()}
      </div>
    </div>
  );
}
