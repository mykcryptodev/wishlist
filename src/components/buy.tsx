"use client";

import sdk from "@farcaster/miniapp-sdk";
import { useTheme } from "next-themes";
import { FC } from "react";
import { toast } from "sonner";
import { BuyWidget, darkTheme, lightTheme } from "thirdweb/react";

import { Button } from "@/components/ui/button";
import { chain, usdc, wish } from "@/constants";
import { useIsInMiniApp } from "@/hooks/useIsInMiniApp";
import { toCaip19 } from "@/lib/utils";
import { client } from "@/providers/Thirdweb";

export const Buy: FC = () => {
  const { isInMiniApp } = useIsInMiniApp();
  const { resolvedTheme } = useTheme();

  const handleMiniAppSwap = async () => {
    if (isInMiniApp) {
      await sdk.actions.swapToken({
        sellToken: toCaip19({ address: usdc[chain.id], chain }),
        buyToken: toCaip19({ address: wish[chain.id], chain }),
      });
    } else {
      toast.error("You must be in a Mini App to swap");
    }
  };

  return (
    <>
      {isInMiniApp ? (
        <div className="flex flex-col gap-2 items-center w-full">
          <Button className="mt-4" size="lg" onClick={handleMiniAppSwap}>
            Buy $WISH
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 items-center w-full">
          <BuyWidget
            chain={chain}
            client={client}
            showThirdwebBranding={false}
            tokenAddress={wish[chain.id] as `0x${string}`}
            style={{
              border: "none",
            }}
            theme={
              resolvedTheme === "dark"
                ? darkTheme({
                    colors: { modalBg: "--var(--card-background)" },
                  })
                : lightTheme({
                    colors: { modalBg: "var(--card-background)" },
                  })
            }
          />
        </div>
      )}
    </>
  );
};

export default Buy;
