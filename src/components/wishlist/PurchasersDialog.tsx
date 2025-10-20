"use client";

import {
  RefreshCw,
  UserMinus,
  UserPlus,
  Users as UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountAvatar, AccountName, AccountProvider } from "thirdweb/react";
import { shortenAddress } from "thirdweb/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthToken } from "@/hooks/useAuthToken";
import { useTransactionMonitor } from "@/hooks/useTransactionMonitor";
import { client } from "@/providers/Thirdweb";

interface Purchaser {
  purchaser: string;
  signedUpAt: string;
  exists: boolean;
}

interface PurchasersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemTitle: string;
  currentUserAddress?: string;
  isOwner?: boolean;
  onPurchaserChange?: () => void; // Callback when purchaser list changes
}

export function PurchasersDialog({
  open,
  onOpenChange,
  itemId,
  itemTitle,
  currentUserAddress,
  isOwner = false,
  onPurchaserChange,
}: PurchasersDialogProps) {
  const { token } = useAuthToken();
  const [purchasers, setPurchasers] = useState<Purchaser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [loadingToastId, setLoadingToastId] = useState<string | number | null>(
    null,
  );

  const isCurrentUserPurchaser = purchasers.some(
    p => p.purchaser.toLowerCase() === currentUserAddress?.toLowerCase(),
  );

  // Monitor transaction status
  useTransactionMonitor({
    transactionId,
    onSuccess: () => {
      // Dismiss the loading toast if it exists
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
        setLoadingToastId(null);
      }
      toast.success(
        isCurrentUserPurchaser
          ? "Removed from purchasers!"
          : "Signed up as purchaser!",
      );
      setTransactionId(null);
      setActionLoading(false);
      // Add a small delay to allow blockchain state to update
      setTimeout(() => {
        fetchPurchasers();
        onPurchaserChange?.();
      }, 1500);
    },
    onError: error => {
      // Dismiss the loading toast if it exists
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
        setLoadingToastId(null);
      }
      toast.error(`Transaction failed: ${error}`);
      setTransactionId(null);
      setActionLoading(false);
    },
  });

  const fetchPurchasers = async () => {
    try {
      setLoading(true);

      const headers: HeadersInit = {};
      // Send JWT token if available (more secure)
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else if (currentUserAddress) {
        // Fallback to wallet address header
        headers["x-wallet-address"] = currentUserAddress;
      }

      const response = await fetch(
        `/api/wishlist/${itemId}/purchasers?itemId=${itemId}`,
        { headers },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch purchasers");
      }

      const data = await response.json();

      if (data.success) {
        // If user is owner, purchasers will be empty
        if (data.isOwner) {
          setPurchasers([]);
          toast.info(
            "As the item owner, you can't see who wants to purchase this item",
          );
        } else {
          // Ensure purchasers is an array
          const purchasersList = Array.isArray(data.purchasers)
            ? data.purchasers
            : [];
          setPurchasers(purchasersList);
        }
      }
    } catch (error) {
      console.error("Error fetching purchasers:", error);
      toast.error("Failed to load purchasers");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!currentUserAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/wishlist/${itemId}/purchasers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          purchaserAddress: currentUserAddress,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTransactionId(data.transactionId);
        const toastId = toast.loading(
          "Signing up as purchaser... Please wait for confirmation.",
        );
        setLoadingToastId(toastId);
      } else {
        throw new Error(data.error || "Failed to sign up as purchaser");
      }
    } catch (error) {
      console.error("Error signing up as purchaser:", error);
      toast.error(error instanceof Error ? error.message : "Failed to sign up");
      setActionLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentUserAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(
        `/api/wishlist/${itemId}/purchasers?itemId=${itemId}&purchaserAddress=${currentUserAddress}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (data.success) {
        setTransactionId(data.transactionId);
        const toastId = toast.info(
          "Removing from purchasers... Please wait for confirmation.",
        );
        setLoadingToastId(toastId);
      } else {
        throw new Error(data.error || "Failed to remove purchaser");
      }
    } catch (error) {
      console.error("Error removing purchaser:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove");
      setActionLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (open) {
      fetchPurchasers();
    }
  }, [open, itemId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            Purchasers
          </DialogTitle>
          <DialogDescription>
            People who want to get &quot;{itemTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action buttons for non-owners */}
          {!isOwner && currentUserAddress && (
            <div className="pb-2 border-b">
              {isCurrentUserPurchaser ? (
                <Button
                  className="w-full"
                  disabled={actionLoading || !!transactionId}
                  variant="outline"
                  onClick={handleRemove}
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  {actionLoading || transactionId
                    ? "Processing..."
                    : "Remove Me from This Item"}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  disabled={actionLoading || !!transactionId}
                  onClick={handleSignUp}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {actionLoading || transactionId
                    ? "Processing..."
                    : "I'll Get This Item"}
                </Button>
              )}
            </div>
          )}

          {/* Purchasers list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {purchasers.length}{" "}
                {purchasers.length === 1 ? "person" : "people"} purchasing
              </h4>
              <Button
                className="h-8 w-8 p-0"
                disabled={loading}
                size="sm"
                title="Refresh purchasers"
                variant="ghost"
                onClick={fetchPurchasers}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : purchasers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UsersIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No one has signed up yet</p>
                {!isOwner && (
                  <p className="text-xs mt-1">Be the first to show interest!</p>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {purchasers.map(purchaser => (
                  <div
                    key={purchaser.purchaser}
                    className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <AccountProvider
                      address={purchaser.purchaser}
                      client={client}
                    >
                      <AccountAvatar className="h-10 w-10 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <AccountName
                            className="font-medium text-sm truncate"
                            fallbackComponent={
                              <span className="font-medium text-sm truncate text-muted-foreground">
                                {shortenAddress(purchaser.purchaser)}
                              </span>
                            }
                          />
                          {purchaser.purchaser.toLowerCase() ===
                            currentUserAddress?.toLowerCase() && (
                            <Badge className="text-xs" variant="secondary">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Signed up {formatDate(purchaser.signedUpAt)}
                        </p>
                      </div>
                    </AccountProvider>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
