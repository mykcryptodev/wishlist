"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExchangeManager } from "@/components/exchanges/ExchangeManager";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "@/providers/Thirdweb";

export default function ExchangesPage() {
  const account = useActiveAccount();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gift Exchanges</h1>
          <p className="text-muted-foreground text-lg">
            Create or join gift exchanges to coordinate with friends and family
          </p>
        </div>

        {!account ? (
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                You need to connect your wallet to manage gift exchanges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectButton client={client} />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How Gift Exchanges Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Privacy Rules:</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>
                      <strong>
                        Wishlist owners never see who's purchasing their items
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
                    Say you're in Alice's "Family" exchange, and Alice is also
                    in a "Work" exchange with her coworkers:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>
                      You can see purchaser information because you're in at
                      least one of Alice's exchanges
                    </li>
                    <li>
                      You'll see ALL purchasers from ANY of Alice's exchanges -
                      including her coworkers from the Work exchange
                    </li>
                    <li>
                      This prevents duplicate gifts across all of Alice's
                      exchanges
                    </li>
                    <li>
                      Alice won't see any of this information - only people in
                      her exchanges can
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
