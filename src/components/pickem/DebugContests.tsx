"use client";

import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePickemContract } from "@/hooks/usePickemContract";

export default function DebugContests() {
  const account = useActiveAccount();
  const { getNextContestId, getContest } = usePickemContract();
  const [debugInfo, setDebugInfo] = useState<
    | {
        nextContestId: string;
        totalContests: string;
        contests: unknown[];
        account: string;
      }
    | { error: string }
    | null
  >(null);
  const [loading, setLoading] = useState(false);

  const debugContests = async () => {
    if (!account) return;

    setLoading(true);
    try {
      console.log("🔍 Starting debug...");

      const nextId = await getNextContestId();
      console.log("📊 Next contest ID:", nextId);

      const contests = [];
      for (let i = 0; i < nextId; i++) {
        try {
          console.log(`🔍 Fetching contest ${i}...`);
          const contest = await getContest(i);
          console.log(`✅ Contest ${i}:`, contest);
          console.log(`Contest ${i} id:`, contest?.id, `Expected: ${i}`);

          if (contest && contest.id === BigInt(i)) {
            contests.push({
              id: Number(contest.id),
              creator: contest.creator,
              seasonType: contest.seasonType,
              weekNumber: contest.weekNumber,
              year: Number(contest.year),
              entryFee: contest.entryFee.toString(),
              currency: contest.currency,
              totalPrizePool: contest.totalPrizePool.toString(),
              totalEntries: Number(contest.totalEntries),
              submissionDeadline: Number(contest.submissionDeadline),
              gamesFinalized: contest.gamesFinalized,
              gameIds: contest.gameIds.map(id => id.toString()),
            });
          }
        } catch (err) {
          console.log(`❌ Contest ${i} error:`, err);
        }
      }

      setDebugInfo({
        nextContestId: nextId.toString(),
        totalContests: contests.length.toString(),
        contests: contests,
        account: account.address,
      });

      console.log("🎯 Debug complete:", {
        nextContestId: Number(nextId),
        totalContests: contests.length,
        contests: contests,
      });
    } catch (error) {
      console.error("💥 Debug error:", error);
      setDebugInfo({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Debug Contests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button disabled={!account || loading} onClick={debugContests}>
          {loading ? "Debugging..." : "Debug Contests"}
        </Button>

        {debugInfo && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Debug Results:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {!account && (
          <p className="text-muted-foreground">
            Please connect your wallet first
          </p>
        )}
      </CardContent>
    </Card>
  );
}
