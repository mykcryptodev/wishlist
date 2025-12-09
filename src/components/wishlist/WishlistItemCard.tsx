"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import {
  Coins,
  Edit,
  ExternalLink,
  ShoppingCart,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useIsInMiniApp } from "@/hooks/useIsInMiniApp";
import { getCryptoPurchaseUrl } from "@/lib/crypto-purchase";

import { FindCheapestButton } from "./FindCheapestButton";

interface WishlistItemCardProps {
  item: {
    id: string;
    owner: string;
    title: string;
    description: string;
    url: string;
    imageUrl: string;
    price: string;
    createdAt: string;
    updatedAt: string;
  };
  onDelete?: (itemId: string) => void;
  onEdit?: (itemId: string) => void;
  onViewPurchasers?: (itemId: string) => void;
  onPurchaseInterest?: (itemId: string) => void;
  isDeleting?: boolean;
  viewMode?: "owner" | "public";
  purchaserCount?: number;
  isUserPurchaser?: boolean;
}

export function WishlistItemCard({
  item,
  onDelete,
  onEdit,
  onViewPurchasers,
  onPurchaseInterest,
  isDeleting = false,
  viewMode = "owner",
  purchaserCount = 0,
  isUserPurchaser = false,
}: WishlistItemCardProps) {
  const { isInMiniApp, isLoading: isMiniAppLoading } = useIsInMiniApp();
  const [isOpeningMiniApp, setIsOpeningMiniApp] = useState(false);

  const formatPrice = (priceInWei: string) => {
    if (!priceInWei || priceInWei === "undefined" || priceInWei === "null") {
      return "Price not specified";
    }
    const price = parseFloat(priceInWei) / 1e18;
    if (isNaN(price) || price === 0) return "Price not specified";
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if this product supports crypto purchase
  const cryptoPurchaseUrl = getCryptoPurchaseUrl(item.url);
  const canBuyWithCrypto =
    isInMiniApp && cryptoPurchaseUrl && !isMiniAppLoading;

  const handleBuyWithCrypto = async () => {
    if (!cryptoPurchaseUrl) return;

    setIsOpeningMiniApp(true);
    try {
      await sdk.actions.openMiniApp({ url: cryptoPurchaseUrl });
    } catch (error) {
      console.error("Failed to open crypto purchase mini app:", error);
      // Optionally show error toast here
    } finally {
      setIsOpeningMiniApp(false);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg z-10">
      {/* Image Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
            src={item.imageUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Badge
            className="backdrop-blur-sm bg-background/80 text-foreground border border-border/60 dark:bg-primary/80 dark:text-primary-foreground dark:border-primary/70"
            variant="secondary"
          >
            {formatPrice(item.price)}
          </Badge>
          {purchaserCount > 0 && onViewPurchasers && (
            <Badge
              className="backdrop-blur-sm bg-primary/90 cursor-pointer hover:bg-primary"
              variant="default"
              onClick={e => {
                e.stopPropagation();
                onViewPurchasers?.(item.id);
              }}
            >
              <Users className="w-3 h-3 mr-1" />
              {purchaserCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-6">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
              {item.title}
            </h3>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {item.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>

      {/* Footer Section */}
      <CardFooter className="p-6 pt-0 flex-col gap-3">
        {viewMode === "owner" ? (
          <>
            {/* Owner View - Primary Actions */}
            <div className="flex gap-2 w-full">
              <Button
                className="flex-1"
                size="sm"
                variant="default"
                onClick={() => window.open(item.url, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Item
              </Button>
              {onViewPurchasers && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewPurchasers?.(item.id)}
                >
                  <Users className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Owner View - Secondary Actions */}
            <div className="flex gap-2 w-full">
              <Button
                className="flex-1"
                size="sm"
                variant="outline"
                onClick={() => onEdit?.(item.id)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                className="flex-1"
                disabled={isDeleting}
                size="sm"
                variant="destructive"
                onClick={() => onDelete?.(item.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>

            {/* Price Comparison - Available to owner */}
            <FindCheapestButton item={item} size="sm" variant="outline" />
          </>
        ) : (
          <>
            {/* Public View - Actions */}
            <div className="flex gap-2 w-full">
              <Button
                className="flex-1"
                size="sm"
                variant="default"
                onClick={() => window.open(item.url, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Item
              </Button>
              {canBuyWithCrypto && (
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={isOpeningMiniApp}
                  size="sm"
                  variant="default"
                  onClick={handleBuyWithCrypto}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  {isOpeningMiniApp ? "Opening..." : "Buy with Crypto"}
                </Button>
              )}
            </div>
            <Button
              className="w-full"
              size="sm"
              variant={isUserPurchaser ? "secondary" : "outline"}
              onClick={() => onPurchaseInterest?.(item.id)}
            >
              {isUserPurchaser ? (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  You&apos;re Getting This
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  I&apos;ll Get This
                </>
              )}
            </Button>

            {/* Price Comparison - Available to viewers */}
            <FindCheapestButton item={item} size="sm" variant="outline" />
          </>
        )}
      </CardFooter>
    </Card>
  );
}
