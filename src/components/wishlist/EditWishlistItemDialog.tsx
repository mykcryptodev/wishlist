"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { WishlistItemForm } from "./WishlistItemForm";

interface EditWishlistItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userAddress: string;
  item: {
    id: string;
    title: string;
    description: string;
    url: string;
    imageUrl: string;
    price: string;
  };
  onSuccess?: () => void;
}

export function EditWishlistItemDialog({
  open,
  onOpenChange,
  userAddress,
  item,
  onSuccess,
}: EditWishlistItemDialogProps) {
  // Convert price from wei to ETH for the form
  const priceInEth = item.price
    ? (parseFloat(item.price) / 1e18).toString()
    : "";

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Wishlist Item</DialogTitle>
          <DialogDescription>
            Update the details of your wishlist item. All changes will be saved
            to the blockchain.
          </DialogDescription>
        </DialogHeader>
        <WishlistItemForm
          itemId={item.id}
          mode="edit"
          userAddress={userAddress}
          initialData={{
            title: item.title,
            description: item.description,
            url: item.url,
            imageUrl: item.imageUrl,
            price: priceInEth,
          }}
          onCancel={() => onOpenChange(false)}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
