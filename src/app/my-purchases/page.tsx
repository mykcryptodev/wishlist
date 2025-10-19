"use client";

import { useState, useEffect } from "react";
import { Blobbie, useActiveAccount } from "thirdweb/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, ExternalLink, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AccountProvider, AccountAvatar, AccountName } from "thirdweb/react";
import { client } from "@/providers/Thirdweb";
import { shortenAddress } from "thirdweb/utils";

interface PurchaseItem {
  id: string;
  owner: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  price: string;
  exists: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MyPurchasesPage() {
  const account = useActiveAccount();
  const userAddress = account?.address;

  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPurchases = async () => {
    if (!userAddress) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/my-purchases?userAddress=${userAddress}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch purchases");
      }

      const data = await response.json();

      if (data.success) {
        setItems(data.items || []);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching my purchases:", error);
      toast.error("Failed to load your purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPurchases();
  }, [userAddress]);

  const formatPrice = (priceInWei: string) => {
    const price = parseFloat(priceInWei) / 1e18;
    if (price === 0) return "Price not specified";
    return `$${price.toFixed(2)}`;
  };

  if (!userAddress) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6" />
                  My Purchases
                </CardTitle>
                <CardDescription>
                  Items you're planning to purchase for others
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  Connect Your Wallet
                </h3>
                <p className="text-muted-foreground">
                  Please connect your wallet to see items you're purchasing
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
              My Purchases
            </h1>
            <p className="text-xl text-muted-foreground">
              Loading items you're purchasing...
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <div className="aspect-video w-full bg-muted animate-pulse" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
            My Purchases
          </h1>
          <p className="text-xl text-muted-foreground">
            Items you're planning to purchase for others
          </p>
        </div>

        {items.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
              <p className="text-muted-foreground mb-4">
                Browse wishlists and sign up to purchase items for others
              </p>
              <Link href="/users">
                <Button>Browse Wishlists</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <PurchaseItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function PurchaseItemCard({ item }: { item: PurchaseItem }) {
  const formatPrice = (priceInWei: string) => {
    const price = parseFloat(priceInWei) / 1e18;
    if (price === 0) return "Price not specified";
    return `$${price.toFixed(2)}`;
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      {/* Image Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          <Badge
            variant="secondary"
            className="backdrop-blur-sm bg-background/80"
          >
            {formatPrice(item.price)}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-6">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
              {item.title}
            </h3>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
          </div>

          {/* Owner Info */}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Buying for:</p>
            <AccountProvider address={item.owner} client={client}>
              <div className="flex items-center gap-2">
                <AccountAvatar
                  className="h-8 w-8 rounded-full"
                  fallbackComponent={
                    <Blobbie
                      address={item.owner}
                      className="h-8 w-8 rounded-full"
                    />
                  }
                />
                <AccountName
                  className="font-medium text-sm"
                  fallbackComponent={
                    <span className="font-medium text-sm text-muted-foreground">
                      {shortenAddress(item.owner)}
                    </span>
                  }
                />
              </div>
            </AccountProvider>
          </div>
        </div>
      </CardContent>

      {/* Footer Section */}
      <div className="p-6 pt-0 flex gap-2">
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={() => window.open(item.url, "_blank")}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Item
        </Button>
        <Link href={`/wishlist/${item.owner}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <User className="w-4 h-4 mr-2" />
            Wishlist
          </Button>
        </Link>
      </div>
    </Card>
  );
}
