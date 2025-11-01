"use client";

import { FC, useState } from "react";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
import { useStakedBalance } from "@/hooks/useStakedBalance";
import { useBurnableAmount } from "@/hooks/useBurnableAmount";
import { shortenLargeNumber } from "thirdweb/utils";
import { ConnectButton } from "./auth/ConnectButton";
import { Flame, Gift } from "lucide-react";

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

      // Reset form and refetch balances
      setStakeAmount("");
      await Promise.all([refetchBalance(), refetchStaked(), refetchBurnable()]);
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

      // Reset form and refetch balances
      setUnstakeAmount("");
      await Promise.all([refetchBalance(), refetchStaked(), refetchBurnable()]);
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

      // Set burnable to 0 after successful transaction
      queryClient.setQueryData(["burnableAmount", chain.id, account?.address], {
        burnable: BigInt(0),
        burnableFormatted: "0",
      });

      toast.success(
        `Successfully burned ${shortenLargeNumber(Number(amountToBurn)).toLocaleString()} WISH from supply!`,
      );

      // Refetch to get the accurate new burnable amount
      await refetchBurnable();
    } catch (error) {
      console.error("Burn error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to burn tokens",
      );
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
      queryClient.setQueryData(
        ["stakedBalance", chain.id, account?.address],
        (oldData: any) => ({
          ...oldData,
          rewards: BigInt(0),
          rewardsFormatted: "0",
        }),
      );

      toast.success(
        `Successfully claimed ${shortenLargeNumber(Number(amountToClaim)).toLocaleString()} WISH rewards!`,
      );

      // Refetch to get accurate balances
      await Promise.all([refetchStaked(), refetchBalance()]);
    } catch (error) {
      console.error("Claim error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to claim rewards",
      );
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
                  {shortenLargeNumber(
                    Number(balance.displayValue),
                  ).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">
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
                  {shortenLargeNumber(Number(stakedBalance)).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">WISH</span>
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
            ) : apy !== undefined ? (
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
              <Label htmlFor="unstake-amount">Amount</Label>
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
                  `${shortenLargeNumber(Number(rewardsBalance)).toLocaleString()} WISH`
                )}
              </span>
            </div>
            <Button
              className="w-full"
              variant="default"
              onClick={handleClaimRewards}
              disabled={
                isLoadingStaked || Number(rewardsBalance) <= 0 || isClaiming
              }
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
                  `${shortenLargeNumber(Number(burnableBalance)).toLocaleString()} WISH`
                )}
              </span>
            </div>
            <Button
              className="w-full"
              variant="destructive"
              onClick={handleBurn}
              disabled={
                isLoadingBurnable || Number(burnableBalance) <= 0 || isBurning
              }
            >
              {isBurning ? (
                "Burning..."
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
    </Card>
  );
};

export default Stake;
