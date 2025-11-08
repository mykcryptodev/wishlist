"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EligibleAddressesResponse {
  addresses: string[];
  totalAddresses: number;
  eligibleAddresses: number;
  uniqueFids: number;
  minScore: number;
}

export default function AdminPage() {
  const [minScore, setMinScore] = useState("0.9");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EligibleAddressesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchEligibleAddresses = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const score = parseFloat(minScore);
      if (isNaN(score) || score < 0 || score > 1) {
        setError("Please enter a valid score between 0 and 1");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/admin/eligible-addresses?minScore=${score}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch eligible addresses",
        );
      }

      const data: EligibleAddressesResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-6xl mt-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">🔐</span>
            <h1 className="text-4xl font-bold text-outlined">Admin Panel</h1>
            <span className="text-4xl">⚙️</span>
          </div>
          <p className="text-muted-foreground text-lg">
            Manage eligible addresses based on Neynar scores
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Get Eligible Addresses</CardTitle>
              <CardDescription>
                Fetch all wishlist addresses filtered by minimum Neynar score.
                Addresses are automatically deduped by FID, preferring primary
                Ethereum addresses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minScore">Minimum Neynar Score (0-1)</Label>
                <Input
                  id="minScore"
                  max="1"
                  min="0"
                  placeholder="0.9"
                  step="0.01"
                  type="number"
                  value={minScore}
                  onChange={e => setMinScore(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Default: 0.9. Addresses with scores below this threshold will
                  be filtered out.
                </p>
              </div>

              <Button
                className="w-full"
                disabled={loading}
                onClick={handleFetchEligibleAddresses}
              >
                {loading ? "Fetching..." : "Get Eligible Addresses"}
              </Button>

              {error && (
                <div className="p-4 border border-destructive bg-destructive/10 rounded-md">
                  <p className="text-sm text-destructive font-medium">
                    Error: {error}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>
                  Found {result.eligibleAddresses} eligible addresses out of{" "}
                  {result.totalAddresses} total addresses ({result.uniqueFids}{" "}
                  unique FIDs)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Addresses
                    </p>
                    <p className="text-2xl font-bold">
                      {result.totalAddresses}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Eligible
                    </p>
                    <p className="text-2xl font-bold">
                      {result.eligibleAddresses}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Unique FIDs
                    </p>
                    <p className="text-2xl font-bold">{result.uniqueFids}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Min Score
                    </p>
                    <p className="text-2xl font-bold">{result.minScore}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Eligible Addresses</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(result.addresses.join("\n"))
                      }
                    >
                      Copy All
                    </Button>
                  </div>
                  <div className="p-4 bg-muted rounded-md max-h-96 overflow-y-auto">
                    <pre className="text-xs font-mono">
                      {result.addresses.join("\n")}
                    </pre>
                  </div>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(JSON.stringify(result.addresses, null, 2))
                    }
                  >
                    Copy as JSON Array
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
