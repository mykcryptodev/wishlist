"use client";

import { Gift } from "lucide-react";
import { FC, useState } from "react";
import { toast } from "sonner";
import { getContract, waitForReceipt } from "thirdweb";
import { claimERC20 } from "thirdweb/extensions/airdrop";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { airdrop as airdropAddress, chain, wish } from "@/constants";
import { client } from "@/providers/Thirdweb";

import { ConnectButton } from "../auth/ConnectButton";
import { useAirdropEligibility } from "@/hooks/useAirdropEligibility";

// Token address that is being airdropped
// This is the ERC20 token address that users will receive
const AIRDROP_TOKEN_ADDRESS = wish[chain.id]; // Using WISH token as default

export const Claim: FC = () => {
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();
  const [isClaiming, setIsClaiming] = useState(false);

  const airdropContractAddress = airdropAddress[chain.id];

  const {
    data: eligibility,
    isLoading: isLoadingEligibility,
    refetch: refetchEligibility,
  } = useAirdropEligibility(
    account?.address,
    airdropContractAddress || undefined,
  );

  const handleClaim = async () => {
    console.log("Claiming...");
    if (!account?.address || !airdropContractAddress) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsClaiming(true);
    try {
      const airdropContract = getContract({
        client,
        chain,
        address: airdropContractAddress,
      });

      // Use thirdweb's claimERC20 extension
      const claimTransaction = claimERC20({
        contract: airdropContract,
        tokenAddress: AIRDROP_TOKEN_ADDRESS,
        recipient: account.address,
      });

      console.log(claimTransaction);

      // Send the transaction
      const transactionResult = await sendTx(claimTransaction);

      // Wait for receipt
      const receipt = await waitForReceipt({
        client,
        chain,
        transactionHash: transactionResult.transactionHash,
      });

      const claimedAmount = eligibility?.eligibleAmountFormatted || "tokens";
      toast.success(`Successfully claimed ${claimedAmount}!`);

      // Refetch eligibility after successful claim
      setTimeout(() => {
        refetchEligibility();
      }, 2000);
    } catch (error) {
      console.error("Error claiming airdrop:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to claim airdrop. Please try again.",
      );
    } finally {
      setIsClaiming(false);
    }
  };

  if (!account) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardDescription>
            Connect your wallet to check your airdrop eligibility and claim
            tokens
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
      <CardContent className="space-y-6">
        {/* Eligibility Display */}
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Eligible Amount</span>
            </div>
            <span className="text-lg font-bold text-primary">
              {isLoadingEligibility ? (
                <span className="text-sm text-muted-foreground">
                  Loading...
                </span>
              ) : eligibility?.isEligible ? (
                <>
                  {Number(eligibility.eligibleAmountFormatted).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 4,
                    },
                  )}{" "}
                  tokens
                </>
              ) : (
                "0 tokens"
              )}
            </span>
          </div>
          {eligibility && eligibility.hasClaimed && (
            <p className="text-xs text-green-600 font-medium">
              ✅ You have already claimed your airdrop tokens!
            </p>
          )}
          {eligibility &&
            !eligibility.isEligible &&
            eligibility.eligibleAmount === BigInt(0) && (
              <p className="text-xs text-muted-foreground">
                You are not currently eligible for this airdrop.
              </p>
            )}
        </div>

        {/* Claim Button */}
        <Button
          className="w-full"
          disabled={
            isLoadingEligibility ||
            (eligibility &&
              (!eligibility.isEligible ||
                eligibility.eligibleAmount === BigInt(0) ||
                eligibility.hasClaimed)) ||
            isClaiming
          }
          onClick={handleClaim}
        >
          {isClaiming ? (
            "Claiming..."
          ) : eligibility?.hasClaimed ? (
            "Already Claimed"
          ) : (
            <>
              <Gift className="w-4 h-4 mr-2" />
              Claim Airdrop
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Claim;
