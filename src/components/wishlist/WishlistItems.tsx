"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useTransactionMonitor } from "@/hooks/useTransactionMonitor";
import {
  showLoadingToast,
  showSuccessToast,
  showErrorToast,
} from "@/lib/toast";
import { WishlistItemCard } from "./WishlistItemCard";

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
  const loadingToastIdRef = useRef<string | number | null>(null);

  // Transaction monitoring for delete operations
  const { isMonitoring: isDeleting } = useTransactionMonitor({
    transactionId: deletingTransactionId,
    onSuccess: () => {
      // Dismiss the loading toast
      if (loadingToastIdRef.current) {
        toast.dismiss(loadingToastIdRef.current);
        loadingToastIdRef.current = null;
      }
      showSuccessToast("Item deleted successfully");
      fetchItems(); // Refresh the list
      setDeletingTransactionId(null);
    },
    onError: error => {
      // Dismiss the loading toast
      if (loadingToastIdRef.current) {
        toast.dismiss(loadingToastIdRef.current);
        loadingToastIdRef.current = null;
      }
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
        // Store the loading toast ID so we can dismiss it later
        loadingToastIdRef.current = showLoadingToast(
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

  const handleEdit = (itemId: string) => {
    // TODO: Implement edit functionality
    toast.info("Edit functionality coming soon!");
  };

  const handleViewPurchasers = (itemId: string) => {
    // TODO: Show purchasers modal
    toast.info("Purchasers view coming soon!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Your Wishlist ({items.length})
        </h2>
        <p className="text-muted-foreground mt-2">
          Manage your wishlist items and see who's interested in purchasing them
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <WishlistItemCard
            key={item.id}
            item={item}
            onDelete={deleteItem}
            onEdit={handleEdit}
            onViewPurchasers={handleViewPurchasers}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  );
}
