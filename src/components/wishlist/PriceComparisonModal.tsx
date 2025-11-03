/**
 * Modal to display price comparison results
 *
 * Shows stores sorted by price with savings information
 */

import { ExternalLink, Star, Truck } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PriceComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: {
    cheapestPrice: number;
    stores: Array<{
      name: string;
      price: number;
      url: string;
      savings: number;
      source?: string;
      thumbnail?: string;
      shipping?: string;
      rating?: number;
      installment?: {
        monthlyPrice: number;
        months: number;
      };
    }>;
    comparedAt: string;
  } | null;
  itemTitle: string;
}

export function PriceComparisonModal({
  open,
  onOpenChange,
  results,
  itemTitle,
}: PriceComparisonModalProps) {
  if (!results) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Price Comparison Results</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {itemTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Best Price Summary */}
          <div className="rounded-lg bg-primary/10 p-4">
            <p className="text-sm text-muted-foreground mb-1">
              Best Price Found
            </p>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(results.cheapestPrice)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Updated {formatDate(results.comparedAt)}
            </p>
          </div>

          {/* Store Listings */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Available at {results.stores.length} stores:
            </p>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {results.stores.map((store, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  {/* Product Thumbnail */}
                  {store.thumbnail && (
                    <div className="flex-shrink-0">
                      <Image
                        alt={store.name}
                        className="rounded object-cover"
                        height={80}
                        src={store.thumbnail}
                        width={80}
                      />
                    </div>
                  )}

                  {/* Store Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{store.name}</p>

                    {/* Price and Savings */}
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold">
                          {formatPrice(store.price)}
                        </p>
                        {store.savings > 0.01 && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            {store.savings >= 1
                              ? `Save ${formatPrice(store.savings)}`
                              : "+$0.00"}
                          </span>
                        )}
                        {idx === 0 && (
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                            Best Price
                          </span>
                        )}
                      </div>
                      {/* Show installment info if available */}
                      {store.installment && (
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(store.installment.monthlyPrice)}/mo for{" "}
                          {store.installment.months} months
                        </p>
                      )}
                    </div>

                    {/* Rating */}
                    {store.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">
                          {store.rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Shipping Info */}
                    {store.shipping && (
                      <div className="flex items-center gap-1 mt-1">
                        <Truck className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {store.shipping}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* View Button */}
                  <div className="flex-shrink-0 self-start">
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={store.url}
                        rel="noopener noreferrer"
                        target="_blank"
                        onClick={e => {
                          e.stopPropagation();
                          console.log("Opening store link:", store.url);
                        }}
                      >
                        View
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center pt-2">
            Prices may vary. Check store for current pricing and availability.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
