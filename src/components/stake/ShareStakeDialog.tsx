"use client";

import { Flame, Gift, Share2, X, Zap } from "lucide-react";
import { FC } from "react";
import { shortenLargeNumber } from "thirdweb/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TransactionStats {
  type: "compound" | "claim" | "burn";
  amountClaimed?: string;
  amountCompounded?: string;
  amountBurned?: string;
  userTotalRewards: string;
  userTotalBurned: string;
  globalTotalBurned: string;
}

interface ShareStakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: TransactionStats | null;
}

export const ShareStakeDialog: FC<ShareStakeDialogProps> = ({
  open,
  onOpenChange,
  stats,
}) => {
  if (!stats) return null;

  const getTitle = () => {
    switch (stats.type) {
      case "compound":
        return "Compound Successful!";
      case "claim":
        return "Rewards Claimed!";
      case "burn":
        return "Tokens Burned!";
    }
  };

  const getDescription = () => {
    switch (stats.type) {
      case "compound":
        return "You've optimized your staking position!";
      case "claim":
        return "Rewards added to your wallet!";
      case "burn":
        return "Tokens permanently removed from supply!";
    }
  };

  const formatNumber = (value: string) => {
    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const generateShareText = () => {
    const lines = ["🎯 $WISH Staking Update", ""];

    if (stats.type === "compound" && stats.amountCompounded) {
      lines.push(`⚡ Compounded: ${formatNumber(stats.amountCompounded)} WISH`);
      if (stats.amountBurned && Number(stats.amountBurned) > 0) {
        lines.push(`🔥 Burned: ${formatNumber(stats.amountBurned)} WISH`);
      }
    } else if (stats.type === "claim" && stats.amountClaimed) {
      lines.push(`🎁 Claimed: ${formatNumber(stats.amountClaimed)} WISH`);
    } else if (stats.type === "burn" && stats.amountBurned) {
      lines.push(`🔥 Burned: ${formatNumber(stats.amountBurned)} WISH`);
    }

    lines.push("");
    lines.push("📊 My Stats:");
    lines.push(`• Total Earned: ${formatNumber(stats.userTotalRewards)} WISH`);
    lines.push(`• Total Burned: ${formatNumber(stats.userTotalBurned)} WISH`);
    lines.push("");
    lines.push(
      `🌍 Global: ${shortenLargeNumber(Number(stats.globalTotalBurned)).toLocaleString()} WISH burned`,
    );
    lines.push("");
    lines.push("Stake your $WISH at wishlist.lol");

    return lines.join("\n");
  };

  const handleShare = async () => {
    const text = generateShareText();

    if (navigator.share) {
      try {
        await navigator.share({
          text,
        });
      } catch (error) {
        // User cancelled or share failed
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(text);
      // Could show a toast here
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {stats.type === "compound" && <Zap className="w-5 h-5" />}
            {stats.type === "claim" && <Gift className="w-5 h-5" />}
            {stats.type === "burn" && <Flame className="w-5 h-5" />}
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Details */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">This Transaction</h4>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              {stats.type === "compound" && stats.amountCompounded && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Compounded:
                  </span>
                  <span className="text-sm font-bold">
                    {formatNumber(stats.amountCompounded)} WISH
                  </span>
                </div>
              )}
              {stats.type === "claim" && stats.amountClaimed && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Claimed:
                  </span>
                  <span className="text-sm font-bold text-green-500">
                    {formatNumber(stats.amountClaimed)} WISH
                  </span>
                </div>
              )}
              {stats.amountBurned && Number(stats.amountBurned) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Burned:</span>
                  <span className="text-sm font-bold text-orange-500">
                    {formatNumber(stats.amountBurned)} WISH
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Your All-Time Stats */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Your All-Time Stats</h4>
            <div className="bg-primary/5 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Earned:
                </span>
                <span className="text-sm font-bold text-primary">
                  {formatNumber(stats.userTotalRewards)} WISH
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Burned:
                </span>
                <span className="text-sm font-bold text-orange-500">
                  {formatNumber(stats.userTotalBurned)} WISH
                </span>
              </div>
            </div>
          </div>

          {/* Global Stats */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Global Stats</h4>
            <div className="bg-orange-500/5 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Burned by Everyone:
                </span>
                <span className="text-sm font-bold text-orange-500">
                  {shortenLargeNumber(
                    Number(stats.globalTotalBurned),
                  ).toLocaleString()}{" "}
                  WISH
                </span>
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex gap-2">
            <Button className="flex-1" variant="default" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
