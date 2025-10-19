"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import {
  AccountProvider,
  AccountAvatar,
  AccountName,
  Blobbie,
} from "thirdweb/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/providers/Thirdweb";

interface WishlistDirectoryProps {
  title?: string;
  description?: string;
  maxItems?: number;
  showAll?: boolean;
}

export function WishlistDirectory({
  title = "Browse Wishlists",
  description = "Discover wishlists from our community",
  maxItems,
  showAll = false,
}: WishlistDirectoryProps) {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWishlistAddresses() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/wishlists/addresses");

        if (!response.ok) {
          throw new Error("Failed to fetch wishlist addresses");
        }

        const data = await response.json();
        setAddresses(data.addresses || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching wishlist addresses:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWishlistAddresses();
  }, []);

  const displayedAddresses = maxItems
    ? addresses.slice(0, maxItems)
    : addresses;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {title && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{title}</h2>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No wishlists found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          {description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedAddresses.map(address => (
          <WishlistCard key={address} address={address} />
        ))}
      </div>

      {!showAll && maxItems && addresses.length > maxItems && (
        <div className="text-center pt-4">
          <Link
            href="/users"
            className="text-primary hover:underline font-medium"
          >
            View all {addresses.length} wishlists →
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * Individual wishlist card with Thirdweb AccountProvider for social profiles
 */
function WishlistCard({ address }: { address: string }) {
  return (
    <AccountProvider address={address} client={client}>
      <Link
        href={`/wishlist/${address}`}
        className="block transition-transform hover:scale-[1.02]"
      >
        <Card className="h-full cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AccountAvatar
                className="h-12 w-12 flex-shrink-0 rounded-full"
                fallbackComponent={
                  <Blobbie
                    address={address}
                    className="h-12 w-12 flex-shrink-0 rounded-full"
                  />
                }
              />
              <div className="flex-1 min-w-0">
                <AccountName
                  className="font-semibold text-base mb-1 truncate block"
                  fallbackComponent={
                    <span className="font-semibold text-base mb-1 truncate block text-muted-foreground">
                      {`${address.slice(0, 6)}...${address.slice(-4)}`}
                    </span>
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </AccountProvider>
  );
}
