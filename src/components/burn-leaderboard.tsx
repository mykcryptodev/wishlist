"use client";

import { Flame, Trophy } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import {
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
} from "thirdweb/react";
import { shortenLargeNumber, toTokens } from "thirdweb/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBurnLeaderboard } from "@/hooks/useBurnLeaderboard";
import { cn } from "@/lib/utils";
import { client } from "@/providers/Thirdweb";

interface BurnLeaderboardProps {
  limit?: number;
  className?: string;
}

function formatBurnedAmount(amount: string): string {
  // Use the abbreviated formatter like other parts of the app
  return shortenLargeNumber(
    Number(toTokens(BigInt(amount), 18)),
  ).toLocaleString();
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Trophy className="h-5 w-5 text-amber-600" />;
  return <span className="text-muted-foreground">{rank}</span>;
}

export const BurnLeaderboard: FC<BurnLeaderboardProps> = ({
  limit = 10,
  className,
}) => {
  const { data: leaderboard, isLoading, error } = useBurnLeaderboard(limit);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Burn Leaderboard
        </CardTitle>
        <CardDescription>
          Top $WISHers who have burned tokens from supply
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="ml-auto h-4 w-24" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>Failed to load leaderboard</p>
            <p className="text-sm">{error.message}</p>
          </div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Flame className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No burns recorded yet</p>
            <p className="text-sm">Be the first to burn $WISH tokens!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Total Burned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((burner, index) => (
                <TableRow key={burner.staker}>
                  <TableCell className="font-medium">
                    <div className="flex h-8 w-8 items-center justify-center">
                      {getRankIcon(index + 1)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      className="font-mono text-sm hover:text-primary hover:underline"
                      href={`/wishlist/${burner.staker}`}
                    >
                      <AccountProvider address={burner.staker} client={client}>
                        <div className="flex items-center gap-2">
                          <AccountAvatar
                            className="h-8 w-8 rounded-full"
                            fallbackComponent={
                              <Blobbie
                                address={burner.staker}
                                className="h-8 w-8 rounded-full"
                              />
                            }
                          />
                          <AccountName
                            className="font-mono text-sm hover:text-primary hover:underline"
                            fallbackComponent={
                              <span className="font-mono text-sm hover:text-primary hover:underline">
                                {truncateAddress(burner.staker)}
                              </span>
                            }
                          />
                        </div>
                      </AccountProvider>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-orange-500">
                      {formatBurnedAmount(burner.totalBurned)}
                    </span>
                    <span className="ml-1 text-muted-foreground">$WISH</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
