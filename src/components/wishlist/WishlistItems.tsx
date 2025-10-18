"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, ExternalLink, Users } from "lucide-react";
import { toast } from "sonner";
import { useTransactionMonitor } from "@/hooks/useTransactionMonitor";
import {
  showLoadingToast,
  showSuccessToast,
  showErrorToast,
} from "@/lib/toast";

interface WishlistItem {
  id: string;
  owner: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  price: string;
  createdAt: string;
  updatedAt: string;
}

interface WishlistItemsProps {
  userAddress: string;
}

export function WishlistItems({ userAddress }: WishlistItemsProps) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    string | null
  >(null);

  // Transaction monitoring for delete operations
  const { isMonitoring: isDeleting } = useTransactionMonitor({
    transactionId: deletingTransactionId,
    onSuccess: () => {
      showSuccessToast("Item deleted successfully");
      fetchItems(); // Refresh the list
      setDeletingTransactionId(null);
    },
    onError: error => {
      showErrorToast("Failed to delete item", error);
      setDeletingTransactionId(null);
    },
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/wishlist?userAddress=${userAddress}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.items);
      } else {
        toast.error(
          `Failed to fetch wishlist items: ${data.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      toast.error("Failed to fetch wishlist items");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        // Start monitoring the delete transaction
        setDeletingTransactionId(data.transactionId);
        showLoadingToast(
          "Deleting item...",
          "Please wait while the item is removed from your wishlist.",
        );
      } else {
        showErrorToast(
          "Failed to delete item",
          data.error || "Unknown error occurred",
        );
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      showErrorToast("Failed to delete item", "Please try again later");
    }
  };

  const formatPrice = (priceInWei: string) => {
    const price = parseFloat(priceInWei) / 1e18;
    if (price === 0) return "Price not specified";
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  useEffect(() => {
    if (userAddress) {
      fetchItems();
    } else {
      setLoading(false);
    }
  }, [userAddress]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Wishlist Items</CardTitle>
          <CardDescription>Loading your wishlist...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Wishlist Items</CardTitle>
          <CardDescription>
            Items you've added to your wishlist will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-6xl mb-4">🎁</div>
            <p className="text-lg">No items in your wishlist yet</p>
            <p className="text-sm">Add your first item using the form above!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Wishlist Items ({items.length})</CardTitle>
        <CardDescription>
          Manage your wishlist items and see who's interested in purchasing them
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map(item => (
            <Card key={item.id} className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <Badge variant="secondary">
                        {formatPrice(item.price)}
                      </Badge>
                    </div>

                    {item.description && (
                      <p className="text-muted-foreground mb-3">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Added: {formatDate(item.createdAt)}</span>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(item.url, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Item
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          toast.info("Edit functionality coming soon!");
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Show purchasers modal
                        toast.info("Purchasers view coming soon!");
                      }}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Purchasers
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
