"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, ExternalLink, Users, ShoppingCart } from "lucide-react";

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
  const formatPrice = (priceInWei: string) => {
    const price = parseFloat(priceInWei) / 1e18;
    if (price === 0) return "Price not specified";
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      {/* Image Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Badge
            variant="secondary"
            className="backdrop-blur-sm bg-background/80"
          >
            {formatPrice(item.price)}
          </Badge>
          {purchaserCount > 0 && (
            <Badge
              variant="default"
              className="backdrop-blur-sm bg-primary/90 cursor-pointer hover:bg-primary"
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

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Added {formatDate(item.createdAt)}</span>
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
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => window.open(item.url, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Item
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewPurchasers?.(item.id)}
              >
                <Users className="w-4 h-4" />
              </Button>
            </div>

            {/* Owner View - Secondary Actions */}
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit?.(item.id)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => onDelete?.(item.id)}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Public View - Actions */}
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={() => window.open(item.url, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Item
            </Button>
            <Button
              variant={isUserPurchaser ? "secondary" : "outline"}
              size="sm"
              className="w-full"
              onClick={() => onPurchaseInterest?.(item.id)}
            >
              {isUserPurchaser ? (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  You're Getting This
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  I'll Get This
                </>
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
