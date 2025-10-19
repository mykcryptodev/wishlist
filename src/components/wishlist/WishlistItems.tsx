"use client";

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useTransactionMonitor } from "@/hooks/useTransactionMonitor";
import {
  showLoadingToast,
  showSuccessToast,
  showErrorToast,
} from "@/lib/toast";
import { WishlistItemCard } from "./WishlistItemCard";
import { PurchasersDialog } from "./PurchasersDialog";

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

export interface WishlistItemsRef {
  refreshItems: () => void;
}

export const WishlistItems = forwardRef<WishlistItemsRef, WishlistItemsProps>(
  ({ userAddress }, ref) => {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingTransactionId, setDeletingTransactionId] = useState<
      string | null
    >(null);
    const [itemToDelete, setItemToDelete] = useState<WishlistItem | null>(null);
    const [purchaserCounts, setPurchaserCounts] = useState<
      Record<string, number>
    >({});
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [selectedItemTitle, setSelectedItemTitle] = useState<string>("");
    const [purchasersDialogOpen, setPurchasersDialogOpen] = useState(false);
    const loadingToastIdRef = useRef<string | number | null>(null);

    // Expose refresh function to parent component
    useImperativeHandle(ref, () => ({
      refreshItems: fetchItems,
    }));

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
        const response = await fetch(
          `/api/wishlist?userAddress=${userAddress}`,
        );
        const data = await response.json();

        if (data.success) {
          setItems(data.items);
          // Fetch purchaser counts for each item
          await fetchPurchaserCounts(data.items);
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

    const fetchPurchaserCounts = async (itemsList: WishlistItem[]) => {
      try {
        const countPromises = itemsList.map(async item => {
          try {
            const response = await fetch(
              `/api/wishlist/${item.id}/purchasers?itemId=${item.id}`,
            );
            const data = await response.json();

            if (data.success) {
              return { itemId: item.id, count: data.count || 0 };
            }
          } catch (error) {
            console.error(
              `Error fetching purchaser count for item ${item.id}:`,
              error,
            );
          }
          return { itemId: item.id, count: 0 };
        });

        const results = await Promise.all(countPromises);
        const countsMap: Record<string, number> = {};
        results.forEach(result => {
          countsMap[result.itemId] = result.count;
        });
        setPurchaserCounts(countsMap);
      } catch (error) {
        console.error("Error fetching purchaser counts:", error);
      }
    };

    const handleDeleteClick = (itemId: string) => {
      const item = items.find(i => i.id === itemId);
      if (item) {
        setItemToDelete(item);
      }
    };

    const confirmDelete = async () => {
      if (!itemToDelete) return;

      try {
        const response = await fetch(`/api/wishlist/${itemToDelete.id}`, {
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
          // Close the dialog
          setItemToDelete(null);
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
              <p className="text-sm">
                Add your first item using the form above!
              </p>
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
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      setSelectedItemId(itemId);
      setSelectedItemTitle(item.title);
      setPurchasersDialogOpen(true);
    };

    const handlePurchaserChange = () => {
      // Refresh purchaser counts when they change
      if (items.length > 0) {
        fetchPurchaserCounts(items);
      }
    };

    return (
      <>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Your Wishlist ({items.length})
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage your wishlist items and see who's interested in purchasing
              them
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <WishlistItemCard
                key={item.id}
                item={item}
                onDelete={handleDeleteClick}
                onEdit={handleEdit}
                onViewPurchasers={handleViewPurchasers}
                isDeleting={isDeleting}
                purchaserCount={purchaserCounts[item.id] || 0}
              />
            ))}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!itemToDelete}
          onOpenChange={(open: boolean) => !open && setItemToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &quot;{itemToDelete?.title}&quot;
                from your wishlist. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Purchasers Dialog */}
        {selectedItemId && (
          <PurchasersDialog
            open={purchasersDialogOpen}
            onOpenChange={setPurchasersDialogOpen}
            itemId={selectedItemId}
            itemTitle={selectedItemTitle}
            currentUserAddress={userAddress}
            isOwner={true}
            onPurchaserChange={handlePurchaserChange}
          />
        )}
      </>
    );
  },
);

WishlistItems.displayName = "WishlistItems";
