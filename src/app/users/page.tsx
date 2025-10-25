"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserSearch } from "@/components/user-search";
import { WishlistDirectory } from "@/components/wishlist/wishlist-directory";

interface User {
  fid: number;
  username: string;
  display_name: string;
  pfp_url?: string;
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("search");

  const handleUserSelect = (user: User) => {
    console.log("Selected user:", user);
    // Navigate to user's profile/wishlist
    // router.push(`/users/${user.fid}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-6xl mt-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">🎁</span>
            <h1 className="text-4xl font-bold text-christmas-gradient">
              Discover Wishlists
            </h1>
            <span className="text-4xl">🎄</span>
          </div>
          <p className="text-muted-foreground text-lg">
            ✨ Search for Farcaster users or browse all wishlists on the
            platform ✨
          </p>
        </div>

        <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 shadow-md">
            <TabsTrigger value="search">🔍 Search Users</TabsTrigger>
            <TabsTrigger value="all">🎅 All Wishlists</TabsTrigger>
          </TabsList>

          <TabsContent className="max-w-4xl mx-auto" value="search">
            <UserSearch onUserSelect={handleUserSelect} />
          </TabsContent>

          <TabsContent value="all">
            <WishlistDirectory description="" showAll={true} title="" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
