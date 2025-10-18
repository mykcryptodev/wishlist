"use client";

import { useState } from "react";
import { AddWishlistItemForm } from "@/components/wishlist/AddWishlistItemForm";
import { WishlistItems } from "@/components/wishlist/WishlistItems";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActiveAccount } from "thirdweb/react";

export default function WishlistPage() {
  const account = useActiveAccount();
  const address = account?.address || "";

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center py-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            My Wishlist
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Create your holiday wishlist by adding items from any website. Just
            paste a link and we'll help you organize your perfect wishlist!
          </p>
        </div>
        {/* Add Item Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <AddWishlistItemForm userAddress={address} />
        </div>

        {/* Wishlist Items */}
        <div className="max-w-4xl mx-auto">
          <WishlistItems userAddress={address} />
        </div>
      </main>
    </div>
  );
}
