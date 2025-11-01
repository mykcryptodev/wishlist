"use client";

import { FC } from "react";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { chain, wish } from "@/constants";
import { client } from "@/providers/Thirdweb";

export const Stake: FC = () => {
  const account = useActiveAccount();

  const {
    data: balance,
    isLoading,
    isError,
  } = useWalletBalance({
    chain,
    address: account?.address,
    client,
    tokenAddress: wish[chain.id],
  });

  if (!account) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Stake $WISH</CardTitle>
          <CardDescription>
            Connect your wallet to stake $WISH tokens and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            Please connect your wallet to continue
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Stake $WISH</CardTitle>
        <CardDescription>
          Lock your tokens to earn rewards and unlock burn capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium">Your $WISH Balance:</span>
            <span className="text-lg font-bold">
              {isLoading ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : isError ? (
                <span className="text-destructive">Failed to load balance</span>
              ) : balance ? (
                `${balance.displayValue} ${balance.symbol}`
              ) : (
                "0 WISH"
              )}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={
              !balance || Number(balance.displayValue) === 0 || isLoading
            }
          >
            Stake Tokens
          </Button>
          <Button className="flex-1" variant="outline">
            Unstake
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Stake;
