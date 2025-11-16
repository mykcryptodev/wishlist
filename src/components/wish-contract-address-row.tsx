"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { chain, wish } from "@/constants";
import { cn } from "@/lib/utils";

const WISH_CONTRACT_ADDRESS = wish[chain.id];

interface WishContractAddressRowProps {
  className?: string;
}

export function WishContractAddressRow({ className }: WishContractAddressRowProps) {
  const [copied, setCopied] = useState(false);
  const [resetTimer, setResetTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <button
      aria-label="Copy $WISH contract address"
      type="button"
      className={cn(
        "group mt-3 flex items-center justify-between gap-2 rounded-md border border-dashed border-accent/40 px-2 py-1 text-[10px] font-mono tracking-tight text-muted-foreground transition hover:text-foreground sm:text-[11px]",
        "whitespace-nowrap",
        className,
      )}
      onClick={handleCopy}
    >
      <span className="truncate">{WISH_CONTRACT_ADDRESS}</span>
      {copied ? (
        <Check aria-hidden className="h-3 w-3 shrink-0 text-emerald-500" />
      ) : (
        <Copy aria-hidden className="h-3 w-3 shrink-0" />
      )}
    </button>
  );
}
