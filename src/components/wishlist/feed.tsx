"use client";

import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AccountAvatar,
  AccountName,
  AccountProvider,
  Blobbie,
} from "thirdweb/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWishlistFeed } from "@/hooks/useWishlistFeed";
import { client } from "@/providers/Thirdweb";

import { WishlistItemCard } from "./WishlistItemCard";

export function WishlistFeed() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch, isRefetching } = useWishlistFeed(
    page,
    20,
  );
  const feedTopRef = useRef<HTMLDivElement>(null);

  // Scroll to top when page changes (after content renders)
  useEffect(() => {
    if (feedTopRef.current && page > 1) {
      // Use requestAnimationFrame to ensure React has finished rendering
      requestAnimationFrame(() => {
        feedTopRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [page, data]); // Depend on both page AND data to handle cached results

  // Helper to shorten address for fallback
  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Transform feed items to match WishlistItemCard interface
  const transformFeedItem = (item: {
    itemId: string;
    owner: string;
    title: string;
    description: string;
    url: string;
    imageUrl: string;
    price: string;
    blockTimestamp: string;
  }) => ({
    id: item.itemId,
    owner: item.owner,
    title: item.title || `Item #${item.itemId}`,
    description: item.description || "",
    url: item.url,
    imageUrl: item.imageUrl || "",
    price: item.price || "0",
    createdAt: item.blockTimestamp,
    updatedAt: item.blockTimestamp,
  });

  // Pagination controls component
  const PaginationControls = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <Button
        disabled={page === 1 || isLoading}
        variant="outline"
        onClick={() => setPage(p => Math.max(1, p - 1))}
      >
        Previous
      </Button>

      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium">
          Page {page}
          {data?.pagination.totalPages && data.pagination.totalPages > 0
            ? ` of ${data.pagination.totalPages}`
            : ""}
        </span>
        {data?.pagination.totalItems && data.pagination.totalItems > 0 && (
          <span className="text-xs text-muted-foreground">
            {data.pagination.totalItems} total wishes
          </span>
        )}
      </div>

      <Button
        disabled={!data?.pagination.hasMore || isLoading}
        variant="outline"
        onClick={() => setPage(p => p + 1)}
      >
        Next
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Scroll anchor for pagination */}
      <div ref={feedTopRef} className="scroll-mt-4" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-yellow-500" />
          <h2 className="text-2xl font-bold text-outlined">Latest Wishes</h2>
        </div>
        <Button
          disabled={isRefetching}
          size="sm"
          variant="outline"
          onClick={() => refetch()}
        >
          {isRefetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {/* Top Pagination */}
      {data && data.items.length > 0 && <PaginationControls />}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              Failed to load feed. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Feed Items */}
      {data && data.items.length > 0 && (
        <div className="space-y-6">
          {data.items.map(item => (
            <div key={`${item.transactionHash}-${item.itemId}`}>
              {/* Attribution Header with Account Info */}
              <AccountProvider address={item.owner} client={client}>
                <Link
                  className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity group"
                  href={`/wishlist/${item.owner}`}
                >
                  <AccountAvatar
                    className="h-8 w-8 rounded-full ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all"
                    fallbackComponent={
                      <Blobbie
                        address={item.owner}
                        className="h-8 w-8 rounded-full"
                      />
                    }
                  />
                  <div className="flex items-baseline gap-2 text-sm">
                    <AccountName
                      className="font-semibold text-foreground"
                      fallbackComponent={
                        <span className="font-semibold text-foreground">
                          {shortenAddress(item.owner)}
                        </span>
                      }
                    />
                    <span className="text-muted-foreground">
                      wished for this
                    </span>
                  </div>
                </Link>
              </AccountProvider>

              {/* Wishlist Item Card */}
              <WishlistItemCard
                item={transformFeedItem(item)}
                viewMode="public"
                onPurchaseInterest={() => {
                  // Navigate to the user's wishlist to see full details
                  window.location.href = `/users/${item.owner}`;
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {data && data.items.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">
                No wishes yet. Be the first to create one!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Pagination */}
      {data && data.items.length > 0 && (
        <div className="pt-4">
          <PaginationControls />
        </div>
      )}
    </div>
  );
}
