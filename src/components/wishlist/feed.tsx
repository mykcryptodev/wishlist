"use client";

import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useWishlistFeed } from "@/hooks/useWishlistFeed";

import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { WishlistItemCard } from "./WishlistItemCard";

export function WishlistFeed() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch, isRefetching } = useWishlistFeed(
    page,
    20,
  );

  // Truncate wallet address
  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Transform feed items to match WishlistItemCard interface
  const transformFeedItem = (item: any) => ({
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-yellow-500" />
          <h2 className="text-2xl font-bold text-outlined">Latest Wishes</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          {isRefetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

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
              {/* Attribution Header */}
              <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                <Link
                  href={`/users/${item.owner}`}
                  className="hover:text-foreground transition-colors font-mono font-semibold"
                >
                  {truncateAddress(item.owner)}
                </Link>
                <span>wished for this</span>
              </div>

              {/* Wishlist Item Card */}
              <WishlistItemCard
                item={transformFeedItem(item)}
                viewMode="public"
                onPurchaseInterest={itemId => {
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

      {/* Pagination */}
      {data && data.items.length > 0 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            disabled={!data.pagination.hasMore || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
