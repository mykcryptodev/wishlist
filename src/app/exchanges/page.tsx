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
                  <h3 className="font-semibold mb-2">For Wishlist Owners:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>
                      You cannot see who has signed up to purchase your items
                    </li>
                    <li>This keeps gifts a surprise!</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    For Purchasers in Your Exchange:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>
                      When viewing someone else's wishlist, you only see other
                      people from your exchange
                    </li>
                    <li>
                      Random people on the internet won't interfere with your
                      gift coordination
                    </li>
                    <li>
                      If no one from your exchange has signed up, you'll know
                      it's safe to purchase
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
