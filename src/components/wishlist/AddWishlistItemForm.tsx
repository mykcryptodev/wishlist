"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { WishlistItemForm } from "./WishlistItemForm";

export function AddWishlistItemForm({
  userAddress,
  onItemAdded,
}: {
  userAddress: string;
  onItemAdded?: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Item to Wishlist</CardTitle>
        <CardDescription>
          Paste a link to any product and we&apos;ll help you extract the
          details. You can always edit the information before adding to your
          wishlist.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WishlistItemForm
          mode="add"
          userAddress={userAddress}
          onSuccess={onItemAdded}
        />
      </CardContent>
    </Card>
  );
}
