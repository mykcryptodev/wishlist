"use client";

import { useActiveAccount } from "thirdweb/react";

import { ConnectButton } from "@/components/auth/ConnectButton";
import { ExchangeManager } from "@/components/exchanges/ExchangeManager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ExchangesPage() {
  const account = useActiveAccount();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl mt-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">🎅</span>
            <h1 className="text-4xl font-bold text-outlined">Gift Exchanges</h1>
            <span className="text-4xl">🎄</span>
          </div>
          <p className="text-muted-foreground text-lg">
            🎁 Create or join gift exchanges to coordinate with friends and
            family 🎁
          </p>
        </div>

        {!account ? (
          <Card className="shadow-lg hover:shadow-xl transition-shadow border-accent/20">
            <CardHeader>
              <CardTitle className="text-outlined">🎁 Login</CardTitle>
              <CardDescription>
                You need to login to manage gift exchanges and join the festive
                fun!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectButton />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow border-accent/20">
              <CardHeader>
                <CardTitle className="text-christmas-gradient">
                  🎄 How Gift Exchanges Work
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Privacy Rules:</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong>
                        Wishlist owners never see who&apos;s purchasing their
                        items
                      </strong>{" "}
                      - keeps gifts a surprise!
                    </li>
                    <li>
                      <strong>Help your purchasers coordinate:</strong> Joining
                      an exchange restricts viewability of purchaser information
                      to only those in the same exchanges. This helps your
                      purchasers coordinate without interference from random
                      people.
                    </li>
                    <li>
                      <strong>Free for all:</strong> If you do not join an
                      exchange, anyone can sign up to purchase items on your
                      list for you.
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    Example: Shopping for Someone in Your Exchange
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Say you&apos;re in Alice&apos;s &quot;Family&quot; exchange,
                    and Alice is also in a &quot;Work&quot; exchange with her
                    coworkers:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>
                      You can see purchaser information because you&apos;re in
                      at least one of Alice&apos;s exchanges
                    </li>
                    <li>
                      You&apos;ll see ALL purchasers from ANY of Alice&apos;s
                      exchanges - including her coworkers from the Work exchange
                    </li>
                    <li>
                      This prevents duplicate gifts across all of Alice&apos;s
                      exchanges
                    </li>
                    <li>
                      Alice won&apos;t see any of this information - only people
                      in her exchanges can
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <ExchangeManager walletAddress={account?.address} />
          </div>
        )}
      </main>
    </div>
  );
}
