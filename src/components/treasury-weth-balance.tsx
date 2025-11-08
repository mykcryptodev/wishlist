"use client";

import { useMemo } from "react";
import { useWalletBalance } from "thirdweb/react";
import { formatUnits } from "viem";

import { AnimatedNumber } from "@/components/ui/animated-number";
import { chain, multisig, weth } from "@/constants";
import { useEthereumPrice } from "@/hooks/useEthereumPrice";
import { cn } from "@/lib/utils";
import { client } from "@/providers/Thirdweb";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const wethFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

export function TreasuryWethBalance({ className }: { className?: string }) {
  const {
    data: wethBalance,
    isLoading,
    isError,
    isFetching,
  } = useWalletBalance({
    client,
    address: multisig[chain.id],
    chain,
    tokenAddress: weth[chain.id],
  });

  const ethereumPrice = useEthereumPrice();

  const usdValue = useMemo(() => {
    if (!wethBalance) return null;
    return (
      Number(formatUnits(wethBalance.value, 18)) * (ethereumPrice.price ?? 0)
    );
  }, [wethBalance, ethereumPrice]);

  const showSkeleton = isLoading || isFetching;

  return (
    <section className={cn("mt-12", className)}>
      <div className="rounded-3xl border border-accent/30 bg-muted/30 px-6 py-8 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          $WISH Fund
        </p>
        <p className="text-xs text-muted-foreground">
          to make holiday wishes come true
        </p>
        <div className="mt-4">
          {showSkeleton ? (
            <div className="mx-auto h-16 w-64 animate-pulse rounded-full bg-muted" />
          ) : usdValue !== null ? (
            <p className="text-5xl font-black md:text-6xl">
              <AnimatedNumber
                duration={800}
                formatNumber={val => usdFormatter.format(val)}
                trend={ethereumPrice.trend}
                value={usdValue}
              />
            </p>
          ) : (
            <p className="text-5xl font-black md:text-6xl">--</p>
          )}
        </div>
        <div className="mt-3">
          {showSkeleton ? (
            <div className="mx-auto h-4 w-48 animate-pulse rounded-full bg-muted" />
          ) : wethBalance !== null ? (
            <p className="text-sm text-muted-foreground md:text-base">
              <AnimatedNumber
                duration={800}
                formatNumber={val => wethFormatter.format(val)}
                value={Number(wethBalance?.displayValue)}
              />{" "}
              <img
                alt="WETH Icon"
                className="inline-block mb-1"
                height={16}
                width={16}
                src={
                  "https://assets.coingecko.com/coins/images/2518/standard/weth.png?1696503332"
                }
              />{" "}
              {wethBalance?.symbol ?? "WETH"}
            </p>
          ) : isError ? (
            <p className="text-sm text-destructive md:text-base">
              Unable to load WETH balance
            </p>
          ) : (
            <p className="text-sm text-muted-foreground md:text-base">– WETH</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default TreasuryWethBalance;
