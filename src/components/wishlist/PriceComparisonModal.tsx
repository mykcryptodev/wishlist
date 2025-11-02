/**
 * Modal to display price comparison results
 *
 * Shows stores sorted by price with savings information
 */

import { ExternalLink } from "lucide-react";

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
              Available at:
            </p>
            {results.stores.map((store, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{store.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-semibold">
                      {formatPrice(store.price)}
                    </p>
                    {store.savings > 0 && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Save {formatPrice(store.savings)}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={store.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                  >
                    View
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))}
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
