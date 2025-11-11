"use client";

import { useRouter } from "next/navigation";

import { useSnapshotProposals } from "@/hooks/useSnapshotProposals";
import { cn } from "@/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
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

function describeTiming(proposal: {
  state: string;
  start: number;
  end: number;
}) {
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

export function SnapshotProposalList() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useSnapshotProposals();

  if (isError) {
    return (
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
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={`proposal-skeleton-${index}`}
            className="h-24 w-full"
          />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No proposals found for this space yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4">
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
                "w-full rounded-xl border p-5 text-left transition-all",
                "border-border bg-background hover:border-primary/50 hover:shadow-md",
              )}
              onClick={() => router.push(`/governance/${proposal.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant={state.variant}>{state.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {proposal.space.name ?? proposal.space.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold leading-tight">
                    {proposal.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {describeTiming(proposal)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>Snapshot #{proposal.snapshot}</span>
                    <span aria-hidden className="text-muted-foreground">
                      •
                    </span>
                    <span>
                      {proposal.votes.toLocaleString()}{" "}
                      {proposal.votes === 1 ? "vote" : "votes"}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
