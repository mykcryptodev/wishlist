"use client";

import { UserSearch } from "@/components/user-search";

interface User {
  fid: number;
  username: string;
  display_name: string;
  pfp_url?: string;
}

export default function UsersPage() {
  const handleUserSelect = (user: User) => {
    console.log("Selected user:", user);
    // Navigate to user's profile/wishlist
    // router.push(`/users/${user.fid}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Find Users
          </h1>
          <p className="text-muted-foreground text-lg">
            Search for Farcaster users to view their wishlists and connect with
            them
          </p>
        </div>

        <UserSearch onUserSelect={handleUserSelect} />
      </main>
    </div>
  );
}
