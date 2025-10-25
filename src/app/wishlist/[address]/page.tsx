"use client";

import { Check, Share2 } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AccountAddress,
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
  ConnectButton,
  useActiveAccount,
} from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PurchasersDialog } from "@/components/wishlist/PurchasersDialog";
import { WishlistItemCard } from "@/components/wishlist/WishlistItemCard";
import { useAuthToken } from "@/hooks/useAuthToken";
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

interface ItemPurchaserData {
  count: number;
  isUserPurchaser: boolean;
}

export default function PublicWishlistPage() {
  const params = useParams();
  const address = params.address as string;
  const account = useActiveAccount();
  const currentUserAddress = account?.address;
  const { token, isLoading: isTokenLoading } = useAuthToken();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [purchaserData, setPurchaserData] = useState<
    Record<string, ItemPurchaserData>
  >({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemTitle, setSelectedItemTitle] = useState<string>("");
  const [purchasersDialogOpen, setPurchasersDialogOpen] = useState(false);

  // Check if current user is the owner of this wishlist
  const isOwner = currentUserAddress?.toLowerCase() === address?.toLowerCase();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/wishlist?userAddress=${address}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.items);
        // Fetch purchaser data for each item
        await fetchPurchaserData(data.items);
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

  const fetchPurchaserData = async (itemsList: WishlistItem[]) => {
    // If user is the owner, don't fetch purchaser data
    if (isOwner) {
      const dataMap: Record<string, ItemPurchaserData> = {};
      itemsList.forEach(item => {
        dataMap[item.id] = { count: 0, isUserPurchaser: false };
      });
      setPurchaserData(dataMap);
      return;
    }

    try {
      const purchaserPromises = itemsList.map(async item => {
        try {
          const headers: HeadersInit = {};
          // Send JWT token if available (more secure)
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          } else if (currentUserAddress) {
            // Fallback to wallet address header
            headers["x-wallet-address"] = currentUserAddress;
          }

          const response = await fetch(
            `/api/wishlist/${item.id}/purchasers?itemId=${item.id}`,
            { headers },
          );
          const data = await response.json();

          if (data.success) {
            const isUserPurchaser =
              currentUserAddress &&
              data.purchasers?.some(
                (p: { purchaser: string }) =>
                  p.purchaser.toLowerCase() ===
                  currentUserAddress.toLowerCase(),
              );

            return {
              itemId: item.id,
              data: {
                count: data.count || 0,
                isUserPurchaser: isUserPurchaser || false,
              },
            };
          }
        } catch (_error) {
          console.error(
            `Error fetching purchasers for item ${item.id}:`,
            _error,
          );
        }
        return {
          itemId: item.id,
          data: { count: 0, isUserPurchaser: false },
        };
      });

      const results = await Promise.all(purchaserPromises);
      const dataMap: Record<string, ItemPurchaserData> = {};
      results.forEach(result => {
        dataMap[result.itemId] = result.data;
      });
      setPurchaserData(dataMap);
    } catch (error) {
      console.error("Error fetching purchaser data:", error);
    }
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
    if (!currentUserAddress) {
      toast.error("Please connect your wallet to sign up as a purchaser");
      return;
    }

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setSelectedItemId(itemId);
    setSelectedItemTitle(item.title);
    setPurchasersDialogOpen(true);
  };

  const handleViewPurchasers = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setSelectedItemId(itemId);
    setSelectedItemTitle(item.title);
    setPurchasersDialogOpen(true);
  };

  const handlePurchaserChange = () => {
    // Refresh purchaser data when it changes
    if (items.length > 0) {
      fetchPurchaserData(items);
    }
  };

  useEffect(() => {
    if (address) {
      fetchItems();
    }
  }, [address]);

  // Refetch purchaser data when user connects/disconnects wallet or token changes
  useEffect(() => {
    if (items.length > 0) {
      fetchPurchaserData(items);
    }
  }, [currentUserAddress, token, items.length]);

  // Additional effect to refetch after token finishes loading
  useEffect(() => {
    if (!isTokenLoading && items.length > 0 && (token || currentUserAddress)) {
      fetchPurchaserData(items);
    }
  }, [isTokenLoading]);

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
                  &apos;s wishlist
                </h1>
              </div>
              <Button
                className="gap-2"
                size="sm"
                variant="outline"
                onClick={copyShareLink}
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
                Browse this wishlist and mark items you&apos;d like to purchase
              </p>
            </div>
          </AccountProvider>
          {!isOwner && items.length > 0 && (
            <div className="relative">
              <Image
                alt="Monster"
                className="absolute -top-10 -right-10"
                height={148}
                src="/images/monster-reading.png"
                style={{ transform: "rotate(-5deg) scaleX(-1)" }}
                width={148}
              />
            </div>
          )}
        </div>

        {/* Connect Wallet Banner for Non-Connected Users */}
        {!currentUserAddress && (
          <Card className="max-w-2xl mx-auto mb-6">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Want to help out?</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet to sign up as a purchaser for items
                  </p>
                </div>
                <ConnectButton client={client} />
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Owner Notice */}
        {isOwner && items.length > 0 && (
          <Card className="max-w-7xl mx-auto bg-muted/50">
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                🎁 You&apos;re viewing your own wishlist. Purchaser information
                is hidden from you to keep gifts a surprise!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Wishlist Items Grid */}
        {items.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="my-6">
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
                  isUserPurchaser={
                    isOwner
                      ? false
                      : purchaserData[item.id]?.isUserPurchaser || false
                  }
                  purchaserCount={
                    isOwner ? 0 : purchaserData[item.id]?.count || 0
                  }
                  onPurchaseInterest={handlePurchaseInterest}
                  onViewPurchasers={isOwner ? undefined : handleViewPurchasers}
                />
              ))}
            </div>
          </div>
        )}

        {/* Purchasers Dialog */}
        {selectedItemId && (
          <PurchasersDialog
            currentUserAddress={currentUserAddress}
            isOwner={false}
            itemId={selectedItemId}
            itemTitle={selectedItemTitle}
            open={purchasersDialogOpen}
            onOpenChange={setPurchasersDialogOpen}
            onPurchaserChange={handlePurchaserChange}
          />
        )}
      </main>
    </div>
  );
}
