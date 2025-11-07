"use client";

import { useMemo } from "react";
import { useWalletBalance } from "thirdweb/react";
import { formatUnits, isAddressEqual } from "viem";

import { chain, multisig, weth } from "@/constants";
import { client } from "@/providers/Thirdweb";
import { useTokens } from "@/hooks/useTokens";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const wethFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

export function TreasuryWethBalance() {
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

  const wethTokenQuery = useTokens(weth[chain.id]);

  const usdValue = useMemo(() => {
    if (!wethBalance) return null;
    const wethToken = wethTokenQuery?.tokens.find(token =>
      isAddressEqual(
        token.address as `0x${string}`,
        weth[chain.id] as `0x${string}`,
      ),
    );
    return (
      Number(formatUnits(wethBalance.value, wethToken?.decimals ?? 0)) *
      (wethToken?.priceUsd ?? 0)
    );
  }, [wethBalance, wethTokenQuery]);

  const showSkeleton = isLoading || isFetching;

  return (
    <section className="mt-12">
      <div className="rounded-3xl border border-accent/30 bg-muted/30 px-6 py-8 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Multisig Treasury Value
        </p>
        <div className="mt-4">
          {showSkeleton ? (
            <div className="mx-auto h-16 w-64 animate-pulse rounded-full bg-muted" />
          ) : usdValue !== null ? (
            <p className="text-5xl font-black md:text-6xl">
              {usdFormatter.format(usdValue)}
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
              {wethFormatter.format(Number(wethBalance?.displayValue))}{" "}
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
