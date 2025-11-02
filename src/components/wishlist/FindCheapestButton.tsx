/**
 * Button component for finding cheapest prices
 *
 * Handles x402 payment flow and displays results modal
 */

"use client";

import { Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthToken } from "@/hooks/useAuthToken";
import { useFindCheapestPrice } from "@/hooks/useFindCheapestPrice";

import { PriceComparisonModal } from "./PriceComparisonModal";

interface FindCheapestButtonProps {
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
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function FindCheapestButton({
  item,
  variant = "outline",
  size = "sm",
}: FindCheapestButtonProps) {
  const { token } = useAuthToken();
  const { findCheapestPriceAsync, isLoading, results, reset } =
    useFindCheapestPrice();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = async () => {
    // Check if user is authenticated first
    if (!token) {
      toast.error("Please sign in first", {
        description:
          "Click the 'Sign In' button in the navigation to authenticate with your wallet",
        duration: 5000,
        icon: <ShieldCheck className="h-5 w-5" />,
      });
      return;
    }

    const toastId = toast.loading("Finding cheapest prices...");

    try {
      const result = await findCheapestPriceAsync(item);

      toast.dismiss(toastId);

      if (result.needsPayment) {
        // Payment required
        toast.info("Payment required: $0.05 to find prices", {
          description: "You'll be prompted to pay with your wallet",
          duration: 5000,
        });
        // TODO: Implement x402 payment flow with Thirdweb SDK
        // For now, user needs to retry after payment is made
        return;
      }

      if (result.success) {
        if (result.cached) {
          toast.success("Price comparison retrieved!", {
            description: "Showing previously cached results",
          });
        } else {
          toast.success("Price comparison complete!", {
            description: "Found the best prices for you",
          });
        }
        setModalOpen(true);
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to find prices", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
      console.error("Error finding cheapest price:", error);
    }
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    // Reset mutation state when modal closes
    if (!open) {
      reset();
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={isLoading}
      >
        <Search className="mr-2 h-4 w-4" />
        Find Cheapest
      </Button>

      <PriceComparisonModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        results={results}
        itemTitle={item.title}
      />
    </>
  );
}
