"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
} from "thirdweb/react";

import { Button } from "@/components/ui/button";
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
  itemsPerPage?: number;
}

export function WishlistDirectory({
  title = "Browse Wishlists",
  description = "Discover wishlists from our community",
  maxItems,
  showAll = false,
  itemsPerPage,
}: WishlistDirectoryProps) {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const displayedAddresses = maxItems && !showAll
    ? addresses.slice(0, maxItems)
    : addresses;

  const totalItems = displayedAddresses.length;
  const totalPages = itemsPerPage
    ? Math.max(1, Math.ceil(totalItems / itemsPerPage))
    : 1;
  const startIndex = itemsPerPage ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = itemsPerPage
    ? Math.min(startIndex + itemsPerPage, totalItems)
    : totalItems;

  useEffect(() => {
    if (!itemsPerPage) {
      return;
    }

    setCurrentPage(1);
  }, [itemsPerPage, totalItems]);

  useEffect(() => {
    if (!itemsPerPage) {
      return;
    }

    const effectiveTotalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    if (currentPage > effectiveTotalPages) {
      setCurrentPage(effectiveTotalPages);
    }
  }, [currentPage, itemsPerPage, totalItems]);

  const paginatedAddresses = useMemo(() => {
    if (!itemsPerPage) {
      return displayedAddresses;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;

    return displayedAddresses.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, displayedAddresses, itemsPerPage]);

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
          {Array.from({ length: itemsPerPage ?? 6 }, (_, index) => index + 1).map(i => (
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
        {paginatedAddresses.map(address => (
          <WishlistCard key={address} address={address} />
        ))}
      </div>

      {!showAll && maxItems && addresses.length > maxItems && (
        <div className="text-center pt-4">
          <Link
            className="text-primary hover:underline font-medium"
            href="/users"
          >
            View all {addresses.length} wishlists →
          </Link>
        </div>
      )}

      {itemsPerPage && totalItems > itemsPerPage && (
        <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{endIndex} of {totalItems} wishlists
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={currentPage === 1}
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              disabled={currentPage === totalPages}
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
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
        className="block transition-transform hover:scale-[1.02]"
        href={`/wishlist/${address}`}
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
