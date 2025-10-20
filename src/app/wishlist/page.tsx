"use client";

import { Check, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";

import { Button } from "@/components/ui/button";
import { AddWishlistItemForm } from "@/components/wishlist/AddWishlistItemForm";
import {
  WishlistItems,
  WishlistItemsRef,
} from "@/components/wishlist/WishlistItems";

export default function WishlistPage() {
  const account = useActiveAccount();
  const address = account?.address || "";
  const [copied, setCopied] = useState(false);
  const wishlistItemsRef = useRef<WishlistItemsRef>(null);

  const handleItemAdded = () => {
    // Refresh the wishlist items when a new item is added
    wishlistItemsRef.current?.refreshItems();
  };

  const copyShareLink = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    const url = `${window.location.origin}/wishlist/${address}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Share link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center py-8 space-y-6">
          <div className="flex flex-col items-center justify-center gap-4 flex-wrap">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              My Wishlist
            </h1>
            {address && (
              <Button
                className="gap-2"
                size="lg"
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
                    Share My Wishlist
                  </>
                )}
              </Button>
            )}
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Create your holiday wishlist by adding items from any website. Just
            paste a link and we&apos;ll help you organize your perfect wishlist!
          </p>
        </div>
        {/* Add Item Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <AddWishlistItemForm
            userAddress={address}
            onItemAdded={handleItemAdded}
          />
        </div>

        {/* Wishlist Items */}
        <div className="max-w-7xl mx-auto">
          <WishlistItems
            ref={wishlistItemsRef}
            showPurchaserInfo={false}
            userAddress={address}
          />
        </div>
      </main>
    </div>
  );
}
