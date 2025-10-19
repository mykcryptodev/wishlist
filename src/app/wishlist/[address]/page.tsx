"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { WishlistItemCard } from "@/components/wishlist/WishlistItemCard";
import {
  AccountAddress,
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
} from "thirdweb/react";
import { client } from "@/providers/Thirdweb";
import { shortenAddress } from "thirdweb/utils";

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

export default function PublicWishlistPage() {
  const params = useParams();
  const address = params.address as string;
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/wishlist?userAddress=${address}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.items);
      } else {
        console.error("API returned error:", data);
        toast.error(
          `Failed to fetch wishlist: ${data.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to fetch wishlist");
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return shortenAddress(addr);
  };

  const copyShareLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handlePurchaseInterest = (itemId: string) => {
    // TODO: Implement purchaser signup
    toast.info("Purchaser signup coming soon!");
  };

  useEffect(() => {
    if (address) {
      fetchItems();
    }
  }, [address]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          {/* Header Section with Profile (Skeletons) */}
          <div className="text-center py-8 space-y-6">
            <div className="flex flex-col items-center gap-4">
              {/* Avatar skeleton */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted animate-pulse ring-4 ring-primary/20" />
              </div>
              {/* Wishlist Title skeleton */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
              </div>
              {/* Share Button skeleton */}
              <div>
                <div
                  className="inline-flex gap-2 px-4 py-2 h-9 rounded-md border border-input bg-muted animate-pulse"
                  style={{ width: 85 }}
                />
              </div>
            </div>
          </div>
          {/* Loading Card for wishlist items */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="h-6 w-40 bg-muted rounded animate-pulse" />
              </CardTitle>
              <CardDescription>
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-6"></div>
                <div className="flex flex-col items-center gap-4">
                  {[...Array(2)].map((_, idx) => (
                    <div key={idx} className="w-full max-w-2xl">
                      <div className="flex gap-4 items-center mb-2">
                        <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-4" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header Section with Profile */}
        <div className="text-center py-8 space-y-6">
          <AccountProvider address={address as `0x${string}`} client={client}>
            {/* Profile Section */}
            <div className="flex flex-col items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <AccountAvatar
                  className="w-24 h-24 rounded-full ring-4 ring-primary/20"
                  fallbackComponent={
                    <Blobbie
                      address={address}
                      className="w-24 h-24 rounded-full"
                    />
                  }
                />
              </div>

              {/* Wishlist Title and Share Button */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  <AccountName
                    fallbackComponent={
                      <AccountAddress formatFn={addr => shortenAddress(addr)} />
                    }
                  />
                  's wishlist
                </h1>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareLink}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Share
                  </>
                )}
              </Button>

              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Browse this wishlist and mark items you'd like to purchase
              </p>
            </div>
          </AccountProvider>
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-lg font-semibold">No items yet</h3>
                <p className="text-sm text-muted-foreground">
                  This wishlist is empty. Check back later!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wishlist Items Grid */}
        {items.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <p className="text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"} in this
                wishlist
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <WishlistItemCard
                  key={item.id}
                  item={item}
                  viewMode="public"
                  onPurchaseInterest={handlePurchaseInterest}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
