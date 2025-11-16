"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { chain, wish } from "@/constants";
import { useIsInMiniApp } from "@/hooks/useIsInMiniApp";
import { cn, toCaip19 } from "@/lib/utils";

const WISH_CONTRACT_ADDRESS = wish[chain.id];

interface WishContractAddressRowProps {
  className?: string;
}

export function WishContractAddressRow({
  className,
}: WishContractAddressRowProps) {
  const [copied, setCopied] = useState(false);
  const [resetTimer, setResetTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const { isInMiniApp } = useIsInMiniApp();

  const wishTokenCaip19 = toCaip19({
    address: WISH_CONTRACT_ADDRESS,
    chain,
  });

  useEffect(() => {
    return () => {
      if (resetTimer) {
        clearTimeout(resetTimer);
      }
    };
  }, [resetTimer]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WISH_CONTRACT_ADDRESS);
      setCopied(true);

      if (resetTimer) {
        clearTimeout(resetTimer);
      }

      const timer = setTimeout(() => {
        setCopied(false);
      }, 2500);
      setResetTimer(timer);

      toast.success("Contract address copied");
    } catch (error) {
      console.error("Failed to copy contract address", error);
      toast.error("Failed to copy address");
    }
  };

  const handleViewToken = async () => {
    try {
      await sdk.actions.viewToken({
        token: wishTokenCaip19,
      });
    } catch (error) {
      console.error("Failed to open token in mini app", error);
      toast.error("Unable to open token");
    }
  };

  const handlePress = () => {
    if (isInMiniApp) {
      void handleViewToken();
      return;
    }

    void handleCopy();
  };

  return (
    <button
      type="button"
      aria-label={
        isInMiniApp ? "View $WISH token" : "Copy $WISH contract address"
      }
      className={cn(
        "group mt-3 flex items-center justify-between gap-2 rounded-md border border-dashed border-accent/40 px-2 py-1 text-[10px] font-mono tracking-tight text-muted-foreground transition hover:text-foreground sm:text-[11px]",
        "whitespace-nowrap",
        className,
      )}
      onClick={handlePress}
    >
      <span className="truncate">{WISH_CONTRACT_ADDRESS}</span>
      {isInMiniApp ? (
        <ExternalLink aria-hidden className="h-3 w-3 shrink-0" />
      ) : copied ? (
        <Check aria-hidden className="h-3 w-3 shrink-0 text-emerald-500" />
      ) : (
        <Copy aria-hidden className="h-3 w-3 shrink-0" />
      )}
    </button>
  );
}
