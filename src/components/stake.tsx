"use client";

import { FC, useState, useEffect } from "react";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { toast } from "sonner";
import { toEther } from "thirdweb";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { chain, wish } from "@/constants";
import { client } from "@/providers/Thirdweb";
import { useStakingAPY } from "@/hooks/useStakingAPY";
import { useStakeContract } from "@/hooks/useStakeContract";
import { shortenLargeNumber } from "thirdweb/utils";

export const Stake: FC = () => {
  const account = useActiveAccount();
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [stakedBalance, setStakedBalance] = useState<string>("0");
  const [isLoadingStaked, setIsLoadingStaked] = useState(false);

  const {
    data: balance,
    isLoading,
    isError,
    refetch: refetchBalance,
  } = useWalletBalance({
    chain,
    address: account?.address,
    client,
    tokenAddress: wish[chain.id],
  });

  const { apy, isLoading: isAPYLoading, error: apyError } = useStakingAPY();
  const { stakeTokens, unstakeTokens, getStakedInfo } = useStakeContract();

  // Fetch staked balance
  useEffect(() => {
    const fetchStakedBalance = async () => {
      if (!account?.address) {
        setStakedBalance("0");
        return;
      }

      setIsLoadingStaked(true);
      try {
        const info = await getStakedInfo(account.address);
        const stakedEther = toEther(info.tokensStaked);
        setStakedBalance(stakedEther);
      } catch (error) {
        console.error("Error fetching staked balance:", error);
        setStakedBalance("0");
      } finally {
        setIsLoadingStaked(false);
      }
    };

    fetchStakedBalance();
  }, [account?.address, getStakedInfo]);

  const handleStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setStakeAmount(value);
    }
  };

  const handleUnstakeAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    // Allow empty string, numbers, and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setUnstakeAmount(value);
    }
  };

  const setMaxStake = () => {
    if (balance) {
      setStakeAmount(balance.displayValue);
    }
  };

  const setMaxUnstake = () => {
    setUnstakeAmount(stakedBalance);
  };

  const refetchStakedBalance = async () => {
    if (!account?.address) return;

    try {
      const info = await getStakedInfo(account.address);
      const stakedEther = toEther(info.tokensStaked);
      setStakedBalance(stakedEther);
    } catch (error) {
      console.error("Error refetching staked balance:", error);
    }
  };

  const isValidStakeAmount =
    stakeAmount &&
    Number(stakeAmount) > 0 &&
    balance &&
    Number(stakeAmount) <= Number(balance.displayValue);

  const handleStake = async () => {
    if (!isValidStakeAmount) return;

    setIsStaking(true);
    try {
      const result = await stakeTokens({
        amount: stakeAmount,
        startTracking: true, // Always start burn tracking when staking
      });

      if (result.batched) {
        toast.success(
          "Transactions submitted! Approval, staking, and burn tracking will be processed together.",
        );
      } else {
        toast.success("Tokens staked successfully!");
      }

      // Reset form and refetch balances
      setStakeAmount("");
      await Promise.all([refetchBalance(), refetchStakedBalance()]);
    } catch (error) {
      console.error("Stake error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to stake tokens",
      );
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || Number(unstakeAmount) <= 0) return;

    setIsUnstaking(true);
    try {
      await unstakeTokens({
        amount: unstakeAmount,
      });

      toast.success("Tokens unstaked successfully!");

      // Reset form and refetch balances
      setUnstakeAmount("");
      await Promise.all([refetchBalance(), refetchStakedBalance()]);
    } catch (error) {
      console.error("Unstake error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to unstake tokens",
      );
    } finally {
      setIsUnstaking(false);
    }
  };

  const BalanceDisplay = () => {
    return (
      <div className="flex justify-between items-center pt-2">
        <span className="text-sm font-medium">Your $WISH Balance:</span>
        <span className="text-lg font-bold">
          {isLoading ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : isError ? (
            <span className="text-destructive">Failed to load balance</span>
          ) : balance ? (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">
                  {shortenLargeNumber(
                    Number(balance.displayValue),
                  ).toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  {balance.symbol}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {Number(balance.displayValue).toLocaleString()}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">0 WISH</span>
          )}
        </span>
      </div>
    );
  };

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
          Lock your tokens to earn rewards and burn capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* APY Display */}
        <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border border-primary/20">
          <span className="text-sm font-medium">Current APY:</span>
          <span className="text-lg font-bold text-primary">
            {isAPYLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : apyError ? (
              <span className="text-destructive text-sm">Failed to load</span>
            ) : apy !== null ? (
              `${shortenLargeNumber(apy).toLocaleString()}%`
            ) : (
              "N/A"
            )}
          </span>
        </div>

        <Tabs defaultValue="stake" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stake">Stake</TabsTrigger>
            <TabsTrigger value="unstake">Unstake</TabsTrigger>
          </TabsList>

          <BalanceDisplay />

          <TabsContent value="stake" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stake-amount">Amount</Label>
              <div className="flex gap-2">
                <Input
                  id="stake-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={stakeAmount}
                  onChange={handleStakeAmountChange}
                  disabled={isLoading || !balance}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={setMaxStake}
                  disabled={isLoading || !balance}
                >
                  Max
                </Button>
              </div>
              {stakeAmount &&
                balance &&
                Number(stakeAmount) > Number(balance.displayValue) && (
                  <p className="text-sm text-destructive">
                    Amount exceeds balance
                  </p>
                )}
            </div>

            <Button
              className="w-full"
              disabled={!isValidStakeAmount || isLoading || isStaking}
              onClick={handleStake}
            >
              {isStaking ? "Staking..." : "Stake Tokens"}
            </Button>
          </TabsContent>

          <TabsContent value="unstake" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="unstake-amount">Amount</Label>
                <span className="text-sm text-muted-foreground">
                  Staked:{" "}
                  {isLoadingStaked ? (
                    "..."
                  ) : (
                    <>
                      {shortenLargeNumber(
                        Number(stakedBalance),
                      ).toLocaleString()}{" "}
                      WISH
                    </>
                  )}
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  id="unstake-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={unstakeAmount}
                  onChange={handleUnstakeAmountChange}
                  disabled={isLoading || isLoadingStaked}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={setMaxUnstake}
                  disabled={
                    isLoading || isLoadingStaked || Number(stakedBalance) === 0
                  }
                >
                  Max
                </Button>
              </div>
              {unstakeAmount &&
                Number(unstakeAmount) > Number(stakedBalance) && (
                  <p className="text-sm text-destructive">
                    Amount exceeds staked balance
                  </p>
                )}
            </div>

            <Button
              className="w-full"
              disabled={
                !unstakeAmount ||
                Number(unstakeAmount) <= 0 ||
                Number(unstakeAmount) > Number(stakedBalance) ||
                isLoading ||
                isLoadingStaked ||
                isUnstaking
              }
              onClick={handleUnstake}
            >
              {isUnstaking ? "Unstaking..." : "Unstake"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Stake;
