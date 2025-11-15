"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { Gift, Share2, X } from "lucide-react";
import { FC } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsInMiniApp } from "@/hooks/useIsInMiniApp";

interface ClaimShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimedAmount: string;
}

export const ClaimShareModal: FC<ClaimShareModalProps> = ({
  open,
  onOpenChange,
  claimedAmount,
}) => {
  const { isInMiniApp } = useIsInMiniApp();

  const formatNumber = (value: string) => {
    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });
  };

  const generateShareText = () => {
    const lines = ["🎁 $WISH Airdrop Claimed!", ""];
    lines.push(`I just claimed ${formatNumber(claimedAmount)} WISH tokens! 🎉`);
    lines.push("");
    lines.push(
      "Create your wishlist and share it with friends at wishlist.holiday",
    );

    return lines.join("\n");
  };

  const handleShare = async () => {
    // If in Farcaster miniapp, compose a cast with embed
    if (isInMiniApp) {
      try {
        const baseUrl =
          typeof window !== "undefined"
            ? window.location.origin
            : "https://wishlist.holiday";

        // Embed the wishlist.holiday/wish page
        const wishPageUrl = `${baseUrl}/wish`;

        // Generate cast text
        const castText = `Just claimed ${formatNumber(claimedAmount)} WISH tokens from the airdrop! 🎁\n\nCreate your wishlist at wishlist.holiday`;

        await sdk.actions.composeCast({
          text: castText,
          embeds: [wishPageUrl],
        });

        onOpenChange(false);
      } catch (error) {
        console.error("Error composing cast:", error);
        // Fallback to regular share
        shareViaDefault();
      }
    } else {
      shareViaDefault();
    }
  };

  const shareViaDefault = async () => {
    const text = generateShareText();
    const wishPageUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/wish`
        : "https://wishlist.holiday/wish";

    if (navigator.share) {
      try {
        await navigator.share({
          text,
          url: wishPageUrl,
        });
      } catch {
        // User cancelled or share failed
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard with URL
      const shareTextWithUrl = `${text}\n\n${wishPageUrl}`;
      await navigator.clipboard.writeText(shareTextWithUrl);
      // Could show a toast here
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Airdrop Claimed!
          </DialogTitle>
          <DialogDescription>
            Share your airdrop claim with friends!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Claim Details */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">This Claim</h4>
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Tokens Claimed:
                </span>
                <span className="text-sm font-bold text-primary">
                  {formatNumber(claimedAmount)} WISH
                </span>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">What&apos;s Next?</h4>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                Create your wishlist and share it with friends at{" "}
                <span className="font-semibold text-foreground">
                  wishlist.holiday
                </span>
              </p>
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
