"use client";

import { ExternalLink, Gift } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
} from "thirdweb/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { chain, multisig } from "@/constants";
import { client } from "@/providers/Thirdweb";

interface WishlistItem {
  id: string;
  owner: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  price: string;
  createdAt: string;
  updatedAt: string;
}

export function FulfilledWishes() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const multisigAddress = multisig[chain.id];

  useEffect(() => {
    const fetchMultisigPurchases = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/my-purchases?userAddress=${multisigAddress}`,
        );
        const data = await response.json();

        if (data.success) {
          setItems(data.items);
        }
      } catch (error) {
        console.error("Error fetching fulfilled wishes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (multisigAddress) {
      fetchMultisigPurchases();
    }
  }, [multisigAddress]);

  const formatPrice = (priceInWei: string) => {
    const price = parseFloat(priceInWei) / 1e18;
    if (price === 0) return "Price not specified";
    return `$${price.toFixed(2)}`;
  };

  // Don't render the section if there are no items
  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <div>
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Skeleton className="aspect-video w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {items.map(item => (
            <Card
              key={item.id}
              className="group overflow-hidden transition-all hover:shadow-lg border-accent/30"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <Link
                    className="flex items-center gap-3 flex-1 min-w-0"
                    href={`/wishlist/${item.owner}`}
                  >
                    <AccountProvider address={item.owner} client={client}>
                      <AccountAvatar
                        className="size-12 rounded-full border-2 border-green-500/30"
                        fallbackComponent={
                          <Blobbie
                            address={item.owner}
                            className="size-12 rounded-full"
                          />
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <CardDescription className="text-xs mb-1">
                          Recipient
                        </CardDescription>
                        <AccountName
                          className="font-semibold text-foreground"
                          fallbackComponent={
                            <span className="font-semibold text-sm truncate block">
                              {`${item.owner.slice(0, 6)}...${item.owner.slice(-4)}`}
                            </span>
                          }
                        />
                      </div>
                    </AccountProvider>
                  </Link>

                  <Badge className="backdrop-blur-sm bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                    <Gift className="w-3 h-3 mr-1" />
                    $WISH Fund
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Item Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {item.imageUrl ? (
                    <img
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                      src={item.imageUrl}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Gift className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge
                      className="backdrop-blur-sm bg-background/80 text-foreground border border-border/60 dark:bg-primary/80 dark:text-primary-foreground dark:border-primary/70"
                      variant="secondary"
                    >
                      {formatPrice(item.price)}
                    </Badge>
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <Button
                      className="w-full"
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(item.url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Item
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
