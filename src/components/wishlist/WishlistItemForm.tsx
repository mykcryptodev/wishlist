"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTransactionMonitor } from "@/hooks/useTransactionMonitor";
import {
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from "@/lib/toast";

// Form validation schema
const wishlistItemSchema = z.object({
  url: z
    .string()
    .min(1, {
      message: "Please enter a URL",
    })
    .url({
      message: "Please enter a valid URL",
    }),
  title: z
    .string()
    .min(1, {
      message: "Title is required",
    })
    .max(200, {
      message: "Title must not exceed 200 characters",
    }),
  description: z
    .string()
    .max(500, {
      message: "Description must not exceed 500 characters",
    })
    .optional(),
  price: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val) return true; // Optional field
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      {
        message: "Price must be a valid positive number",
      },
    ),
  imageUrl: z
    .string()
    .url({
      message: "Please enter a valid image URL",
    })
    .optional()
    .or(z.literal("")),
});

type WishlistItemFormValues = z.infer<typeof wishlistItemSchema>;

// Parse item from URL using our API
const parseItemFromUrl = async (
  url: string,
): Promise<Partial<WishlistItemFormValues>> => {
  try {
    const response = await fetch("/api/parse-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      title: data.title || "",
      description: data.description || "",
      price: data.price || "",
      imageUrl: data.imageUrl || "",
    };
  } catch (error) {
    console.error("Error parsing URL:", error);
    throw new Error(
      `Failed to parse URL: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

interface WishlistItemFormProps {
  mode: "add" | "edit";
  userAddress: string;
  itemId?: string;
  initialData?: Partial<WishlistItemFormValues>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function WishlistItemForm({
  mode,
  userAddress,
  itemId,
  initialData,
  onSuccess,
  onCancel,
}: WishlistItemFormProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parsedData, setParsedData] =
    useState<Partial<WishlistItemFormValues> | null>(null);
  const [currentTransactionId, setCurrentTransactionId] = useState<
    string | null
  >(null);
  const loadingToastIdRef = useRef<string | number | null>(null);

  // Transaction monitoring
  const { status, isMonitoring } = useTransactionMonitor({
    transactionId: currentTransactionId,
    onSuccess: data => {
      // Dismiss the loading toast first, then show success
      if (loadingToastIdRef.current) {
        toast.dismiss(loadingToastIdRef.current);
        loadingToastIdRef.current = null;
      }
      const successMessage =
        mode === "add"
          ? "Item added to wishlist!"
          : "Item updated successfully!";
      const successDescription =
        mode === "add"
          ? `${form.getValues("title")} has been successfully added to your wishlist.`
          : `${form.getValues("title")} has been successfully updated.`;

      showSuccessToast(successMessage, successDescription);

      // Reset form only in add mode
      if (mode === "add") {
        form.reset();
        setParsedData(null);
      }

      setCurrentTransactionId(null);
      onSuccess?.();
    },
    onError: error => {
      // Dismiss the loading toast first, then show error
      if (loadingToastIdRef.current) {
        toast.dismiss(loadingToastIdRef.current);
        loadingToastIdRef.current = null;
      }
      showErrorToast("Transaction failed", error);
      setCurrentTransactionId(null);
    },
  });

  const form = useForm<WishlistItemFormValues>({
    resolver: zodResolver(wishlistItemSchema),
    defaultValues: {
      url: initialData?.url || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      price: initialData?.price || "",
      imageUrl: initialData?.imageUrl || "",
    },
  });

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset({
        url: initialData.url || "",
        title: initialData.title || "",
        description: initialData.description || "",
        price: initialData.price || "",
        imageUrl: initialData.imageUrl || "",
      });
    }
  }, [initialData, form]);

  const handleParseUrl = async () => {
    const url = form.getValues("url");
    if (!url) {
      toast.error("Please enter a URL first");
      return;
    }

    setIsParsing(true);
    try {
      const data = await parseItemFromUrl(url);
      setParsedData(data);

      // Update form with parsed data
      if (data.title) form.setValue("title", data.title);
      if (data.description) form.setValue("description", data.description);
      if (data.price) form.setValue("price", data.price);
      if (data.imageUrl) form.setValue("imageUrl", data.imageUrl);

      toast.success("Item details extracted successfully!");
    } catch (error) {
      console.error("Error parsing URL:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to extract item details";
      toast.error("Failed to parse URL", {
        description: errorMessage,
      });

      // Still allow manual entry even if parsing fails
      toast.info("You can still fill in the details manually", {
        description:
          "Please enter the product information in the form fields below.",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const onSubmit = async (data: WishlistItemFormValues) => {
    if (!userAddress) {
      toast.error("User address is required");
      return;
    }

    if (mode === "edit" && !itemId) {
      toast.error("Item ID is required for editing");
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (mode === "add") {
        response = await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            userAddress,
          }),
        });
      } else {
        response = await fetch(`/api/wishlist/${itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }

      const result = await response.json();

      if (result.success) {
        // Start monitoring the transaction
        setCurrentTransactionId(result.transactionId);
        const message = mode === "add" ? "Adding..." : "Updating...";
        const description =
          mode === "add"
            ? "Your item is being added to the wishlist. Please wait..."
            : "Your item is being updated. Please wait...";
        const toastId = showLoadingToast(message, description);
        loadingToastIdRef.current = toastId;
      } else {
        showErrorToast(
          mode === "add"
            ? "Failed to add item to wishlist"
            : "Failed to update item",
          result.error || "Unknown error occurred",
        );
      }
    } catch (error) {
      console.error(
        `Error ${mode === "add" ? "adding" : "updating"} item:`,
        error,
      );
      showErrorToast(
        mode === "add"
          ? "Failed to add item to wishlist"
          : "Failed to update item",
        "Please try again later",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const url = form.watch("url");

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        {/* URL Input */}
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product URL</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="https://example.com/product" {...field} />
                </FormControl>
                {mode === "add" && (
                  <Button
                    disabled={!url || isParsing}
                    type="button"
                    variant="outline"
                    onClick={handleParseUrl}
                  >
                    {isParsing ? "Parsing..." : "Parse"}
                  </Button>
                )}
              </div>
              <FormDescription>
                {mode === "add"
                  ? "Paste the URL of the product you want to add to your wishlist."
                  : "The URL of the product."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Product title" {...field} />
              </FormControl>
              <FormDescription>
                The name of the product you want to add.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[100px]"
                  placeholder="Product description or notes..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Additional details about the product or personal notes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price and Image URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (Optional)</FormLabel>
                <FormControl>
                  <Input
                    min="0"
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The price of the product if known.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image URL */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...field}
                  />
                </FormControl>
                <FormDescription>URL to the product image.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image Preview */}
        {form.watch("imageUrl") && (
          <div className="space-y-2">
            <FormLabel>Image Preview</FormLabel>
            <div className="border rounded-lg p-4 bg-muted/20">
              <img
                alt="Product preview"
                className="max-w-xs max-h-48 object-contain mx-auto rounded"
                src={form.watch("imageUrl")}
                onError={e => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setParsedData(null);
            }}
          >
            Clear
          </Button>
          <Button disabled={isSubmitting || isMonitoring} type="submit">
            {isSubmitting
              ? "Submitting..."
              : isMonitoring
                ? "Processing..."
                : mode === "add"
                  ? "Add to Wishlist"
                  : "Update Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
