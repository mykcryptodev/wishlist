"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Flame, Gift } from "lucide-react";
import { FC, useState } from "react";
import { toast } from "sonner";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { shortenLargeNumber } from "thirdweb/utils";

import { SplitFlipNumber } from "@/components/ui/animated-number";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { chain, wish } from "@/constants";
import { useBurnableAmount } from "@/hooks/useBurnableAmount";
import { useDailyBurn } from "@/hooks/useDailyBurn";
import { useStakeContract } from "@/hooks/useStakeContract";
import { useStakedBalance } from "@/hooks/useStakedBalance";
import { useStakingAPY } from "@/hooks/useStakingAPY";
import { client } from "@/providers/Thirdweb";

import { ConnectButton } from "./auth/ConnectButton";

const isStakingComingSoon = false;

export const Stake: FC = () => {
  const account = useActiveAccount();
  const queryClient = useQueryClient();
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

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

  const {
    data: stakedData,
    isLoading: isLoadingStaked,
    refetch: refetchStaked,
  } = useStakedBalance(account?.address);

  const {
    data: burnableData,
    isLoading: isLoadingBurnable,
    refetch: refetchBurnable,
  } = useBurnableAmount(account?.address);

  const { data: dailyBurnData, isLoading: isLoadingDailyBurn } = useDailyBurn();

  const stakedBalance = stakedData?.tokensStakedFormatted || "0";
  const rewardsBalance = stakedData?.rewardsFormatted || "0";
  const burnableBalance = burnableData?.burnableFormatted || "0";

  const {
    data: apy,
    isLoading: isAPYLoading,
    error: apyError,
  } = useStakingAPY();
  const { stakeTokens, unstakeTokens, burnTokens, claimRewardsTokens } =
    useStakeContract();

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
      });

      if (result.batched) {
        toast.success(
          "Transactions submitted! Approval and staking will be processed together.",
        );
      } else {
        toast.success(
          "Tokens staked successfully! Burn tracking started automatically.",
        );
      }

      // Reset form
      setStakeAmount("");

      // Delay refetch to allow blockchain to propagate
      setTimeout(() => {
        Promise.all([refetchBalance(), refetchStaked(), refetchBurnable()]);
      }, 1500);
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

      toast.success(
        "Tokens unstaked successfully! Available reward tokens were burned automatically.",
      );

      // Reset form
      setUnstakeAmount("");

      // Delay refetch to allow blockchain to propagate
      setTimeout(() => {
        Promise.all([refetchBalance(), refetchStaked(), refetchBurnable()]);
      }, 1500);
    } catch (error) {
      console.error("Unstake error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to unstake tokens",
      );
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleBurn = async () => {
    if (!burnableBalance || Number(burnableBalance) <= 0) return;

    const amountToBurn = burnableBalance;
    setIsBurning(true);
    try {
      await burnTokens({
        amount: amountToBurn,
      });

      // Optimistically set burnable to 0 after successful transaction
      queryClient.setQueryData(["burnableAmount", chain.id, account?.address], {
        burnable: BigInt(0),
        burnableFormatted: "0",
      });

      toast.success(
        `Successfully burned ${shortenLargeNumber(Number(amountToBurn)).toLocaleString()} WISH from supply!`,
      );

      // Let the automatic refetch interval (10s) handle the next update
      // This prevents flashing by not immediately overwriting the optimistic update
    } catch (error) {
      console.error("Burn error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to burn tokens",
      );
      // On error, refetch to restore correct state
      await refetchBurnable();
    } finally {
      setIsBurning(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!rewardsBalance || Number(rewardsBalance) <= 0) return;

    const amountToClaim = rewardsBalance;
    setIsClaiming(true);
    try {
      await claimRewardsTokens();

      // Optimistically set rewards to 0 after successful transaction
      queryClient.setQueryData<{
        tokensStaked: bigint;
        tokensStakedFormatted: string;
        rewards: bigint;
        rewardsFormatted: string;
      }>(["stakedBalance", chain.id, account?.address], oldData => {
        if (!oldData) {
          return {
            tokensStaked: BigInt(0),
            tokensStakedFormatted: "0",
            rewards: BigInt(0),
            rewardsFormatted: "0",
          };
        }
        return {
          ...oldData,
          rewards: BigInt(0),
          rewardsFormatted: "0",
        };
      });

      toast.success(
        `Successfully claimed ${shortenLargeNumber(Number(amountToClaim)).toLocaleString()} WISH rewards!`,
      );

      // Delay refetch to allow blockchain to propagate
      // This prevents the flash of old data overwriting our optimistic update
      setTimeout(() => {
        Promise.all([refetchStaked(), refetchBalance()]);
      }, 2000);
    } catch (error) {
      console.error("Claim error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to claim rewards",
      );
      // On error, immediately refetch to restore correct state
      await Promise.all([refetchStaked(), refetchBalance()]);
    } finally {
      setIsClaiming(false);
    }
  };

  const BalanceDisplay = () => {
    return (
      <div className="grid grid-cols-2 gap-4 pt-2">
        {/* Wallet Balance */}
        <div className="flex flex-col space-y-1 p-3 bg-muted/50 rounded-lg">
          <span className="text-xs font-medium text-muted-foreground">
            Wallet Balance
          </span>
          {isLoading ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : isError ? (
            <span className="text-sm text-destructive">Failed to load</span>
          ) : balance ? (
            <div className="flex flex-col">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-lg font-bold">
                  <SplitFlipNumber
                    value={shortenLargeNumber(
                      Number(balance.displayValue),
                    ).toLocaleString()}
                  />
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  {balance.symbol}
                </span>
              </div>
              {Number(balance.displayValue) >= 1000 && (
                <span className="text-xs text-muted-foreground">
                  {Number(balance.displayValue).toLocaleString()}
                </span>
              )}
            </div>
          ) : (
            <span className="text-lg font-bold">0 WISH</span>
          )}
        </div>

        {/* Staked Balance */}
        <div className="flex flex-col space-y-1 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <span className="text-xs font-medium text-muted-foreground">
            Staked Balance
          </span>
          {isLoadingStaked ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-lg font-bold">
                  <SplitFlipNumber
                    value={shortenLargeNumber(
                      Number(stakedBalance),
                    ).toLocaleString()}
                  />
                </span>
                <span className="text-xs text-muted-foreground ml-1">WISH</span>
              </div>
              {Number(stakedBalance) >= 1000 && (
                <span className="text-xs text-muted-foreground">
                  {Number(stakedBalance).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!account) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Stake $WISH</CardTitle>
          <CardDescription>
            Login to stake $WISH tokens and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConnectButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto relative">
      {isStakingComingSoon && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/50 backdrop-blur-sm rounded-lg">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">
              Staking and Burning Coming Soon!
            </div>
            <p className="text-muted-foreground">
              Get ready to stake your $WISH tokens
            </p>
          </div>
        </div>
      )}
      <div
        className={isStakingComingSoon ? "opacity-20 pointer-events-none" : ""}
      >
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
              ) : apy !== undefined ? (
                <>
                  <SplitFlipNumber
                    value={shortenLargeNumber(apy).toLocaleString()}
                  />
                  %
                </>
              ) : (
                "N/A"
              )}
            </span>
          </div>

          <Tabs className="w-full" defaultValue="stake">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stake">Stake</TabsTrigger>
              <TabsTrigger value="unstake">Unstake</TabsTrigger>
            </TabsList>

            <BalanceDisplay />

            <TabsContent className="space-y-4" value="stake">
              <div className="space-y-2">
                <Label htmlFor="stake-amount">Amount</Label>
                <div className="flex gap-2">
                  <Input
                    disabled={isLoading || !balance}
                    id="stake-amount"
                    inputMode="decimal"
                    placeholder="0.0"
                    type="text"
                    value={stakeAmount}
                    onChange={handleStakeAmountChange}
                  />
                  <Button
                    disabled={isLoading || !balance}
                    type="button"
                    variant="secondary"
                    onClick={setMaxStake}
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

            <TabsContent className="space-y-4" value="unstake">
              <div className="space-y-2">
                <Label htmlFor="unstake-amount">Amount</Label>
                <div className="flex gap-2">
                  <Input
                    disabled={isLoading || isLoadingStaked}
                    id="unstake-amount"
                    inputMode="decimal"
                    placeholder="0.0"
                    type="text"
                    value={unstakeAmount}
                    onChange={handleUnstakeAmountChange}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={
                      isLoading ||
                      isLoadingStaked ||
                      Number(stakedBalance) === 0
                    }
                    onClick={setMaxUnstake}
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

          {/* Rewards Section - Show if user has staked tokens */}
          {Number(stakedBalance) > 0 && (
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Pending Rewards</span>
                </div>
                <span className="text-lg font-bold text-green-500">
                  {isLoadingStaked ? (
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  ) : (
                    <>
                      <SplitFlipNumber
                        value={shortenLargeNumber(
                          Number(rewardsBalance),
                        ).toLocaleString()}
                      />
                      <span className="ml-1">WISH</span>
                    </>
                  )}
                </span>
              </div>
              <Button
                className="w-full"
                variant="default"
                disabled={
                  isLoadingStaked || Number(rewardsBalance) <= 0 || isClaiming
                }
                onClick={handleClaimRewards}
              >
                {isClaiming ? (
                  "Claiming..."
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Claim Rewards
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Claim your earned staking rewards and add them to your wallet
              </p>
            </div>
          )}

          {/* Burn Section - Show if user has staked tokens */}
          {Number(stakedBalance) > 0 && (
            <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium">Burnable Tokens</span>
                </div>
                <span className="text-lg font-bold text-orange-500">
                  {isLoadingBurnable ? (
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  ) : (
                    <>
                      <SplitFlipNumber
                        value={shortenLargeNumber(
                          Number(burnableBalance),
                        ).toLocaleString()}
                      />
                      <span className="ml-1">WISH</span>
                    </>
                  )}
                </span>
              </div>

              {/* Global Daily Burn Progress */}
              {!isLoadingDailyBurn && dailyBurnData && (
                <div className="mb-3 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Today&apos;s Global Burn Progress</span>
                    <span>
                      {shortenLargeNumber(
                        dailyBurnData.dailyBurned,
                      ).toLocaleString()}{" "}
                      /{" "}
                      {shortenLargeNumber(
                        dailyBurnData.dailyBurnCap,
                      ).toLocaleString()}{" "}
                      WISH
                    </span>
                  </div>
                  <Progress
                    className="h-2"
                    value={dailyBurnData.percentageComplete}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {dailyBurnData.percentageComplete.toFixed(2)}% complete
                    </span>
                    <span>
                      {shortenLargeNumber(
                        dailyBurnData.remaining,
                      ).toLocaleString()}{" "}
                      remaining
                    </span>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                variant="destructive"
                disabled={
                  isLoadingBurnable ||
                  Number(burnableBalance) <= 0 ||
                  isBurning ||
                  dailyBurnData?.isCapReached
                }
                onClick={handleBurn}
              >
                {isBurning ? (
                  "Burning..."
                ) : dailyBurnData?.isCapReached ? (
                  <>
                    <Flame className="w-4 h-4 mr-2" />
                    Daily Burn Cap Reached
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 mr-2" />
                    Burn WISH from supply
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Burns WISH from supply based on your staking duration. This does
                not affect your WISH balance.
              </p>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default Stake;
