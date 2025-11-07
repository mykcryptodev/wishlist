"use client";

import { useEffect, useMemo } from "react";
import { useTokenBalances } from "thirdweb/react";
import { formatUnits } from "viem";

import { chain, multisig } from "@/constants";

const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
const REFRESH_INTERVAL_MS = 15_000;

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const wethFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

export function TreasuryWethBalance() {
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ?? "";

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useTokenBalances({
    clientId,
    walletAddress: multisig[chain.id],
    chainId: chain.id,
    page: 1,
    limit: 50,
  });

  useEffect(() => {
    if (!clientId) return;

    const interval = setInterval(() => {
      void refetch();
    }, REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [clientId, refetch]);

  const wethToken = useMemo(() => {
    return data?.tokens.find(
      token => token.token_address.toLowerCase() === WETH_ADDRESS.toLowerCase(),
    );
  }, [data]);

  const wethBalance = useMemo(() => {
    if (!wethToken) return null;

    try {
      return Number(formatUnits(BigInt(wethToken.balance), wethToken.decimals));
    } catch (error) {
      console.error("Failed to parse WETH balance", error);
      return null;
    }
  }, [wethToken]);

  const usdValue = wethToken?.price_data.usd_value ?? null;

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
            <p className="text-5xl font-black md:text-6xl">–</p>
          )}
        </div>
        <div className="mt-3">
          {showSkeleton ? (
            <div className="mx-auto h-4 w-48 animate-pulse rounded-full bg-muted" />
          ) : wethBalance !== null ? (
            <p className="text-sm text-muted-foreground md:text-base">
              {wethFormatter.format(wethBalance)} WETH
            </p>
          ) : isError ? (
            <p className="text-sm text-destructive md:text-base">
              Unable to load WETH balance
            </p>
          ) : (
            <p className="text-sm text-muted-foreground md:text-base">– WETH</p>
          )}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Updates automatically using onchain data from Thirdweb
        </p>
      </div>
    </section>
  );
}

export default TreasuryWethBalance;
