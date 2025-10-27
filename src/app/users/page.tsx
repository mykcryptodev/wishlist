"use client";

import { useState } from "react";

import { UserSearch } from "@/components/user-search";
import { WishlistDirectory } from "@/components/wishlist/wishlist-directory";

interface User {
  fid: number;
  username: string;
  display_name: string;
  pfp_url?: string;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleUserSelect = (user: User) => {
    console.log("Selected user:", user);
    // Navigate to user's profile/wishlist
    // router.push(`/users/${user.fid}`);
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-6xl mt-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">🎁</span>
            <h1 className="text-4xl font-bold text-outlined">
              Discover Wishlists
            </h1>
            <span className="text-4xl">🎄</span>
          </div>
          <p className="text-muted-foreground text-lg">
            ✨ Browse every onchain wishlist or search for Farcaster friends ✨
          </p>
        </div>

        <div className="mx-auto max-w-4xl mb-8">
          <UserSearch
            className="w-full"
            onQueryChange={setSearchQuery}
            onUserSelect={handleUserSelect}
          />
        </div>

        {!isSearching && (
          <WishlistDirectory
            showAll
            description="Discover wishlists from the Farcaster community."
            itemsPerPage={12}
            title="All Wishlists"
          />
        )}
      </main>
    </div>
  );
}
