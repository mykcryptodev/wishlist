"use client";

import { useState } from "react";
import { UserSearch } from "@/components/user-search";
import { WishlistDirectory } from "@/components/wishlist/wishlist-directory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Discover Wishlists
          </h1>
          <p className="text-muted-foreground text-lg">
            Search for Farcaster users or browse all wishlists on the platform
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="search">Search Users</TabsTrigger>
            <TabsTrigger value="all">All Wishlists</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="max-w-4xl mx-auto">
            <UserSearch onUserSelect={handleUserSelect} />
          </TabsContent>

          <TabsContent value="all">
            <WishlistDirectory title="" description="" showAll={true} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
