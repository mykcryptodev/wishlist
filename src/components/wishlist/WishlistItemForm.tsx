"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useEffect, useRef, useState } from "react";
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
import { tryResolveScheme, uploadImageToIpfs } from "@/lib/image-upload";
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
  const [currentTransactionId, setCurrentTransactionId] = useState<
    string | null
  >(null);
  const loadingToastIdRef = useRef<string | number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.imageUrl ? tryResolveScheme(initialData.imageUrl) : null,
  );

  // Transaction monitoring
  const { isMonitoring } = useTransactionMonitor({
    transactionId: currentTransactionId,
    onSuccess: () => {
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
      const resolvedImageUrl = initialData.imageUrl
        ? tryResolveScheme(initialData.imageUrl)
        : "";

      form.reset({
        url: initialData.url || "",
        title: initialData.title || "",
        description: initialData.description || "",
        price: initialData.price || "",
        imageUrl: resolvedImageUrl,
      });
      setUploadedFile(null);
      setPreviewUrl(resolvedImageUrl || null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [initialData, form]);

  const watchedImageUrl = form.watch("imageUrl");

  useEffect(() => {
    if (!uploadedFile) {
      setPreviewUrl(watchedImageUrl ? tryResolveScheme(watchedImageUrl) : null);
    }
  }, [uploadedFile, watchedImageUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!file) {
      setUploadedFile(null);
      setPreviewUrl(form.getValues("imageUrl") || null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      event.target.value = "";
      return;
    }

    setUploadedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    form.setValue("imageUrl", "");
  };

  const handleRemoveUploadedFile = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(form.getValues("imageUrl") || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleParseUrl = async () => {
    const url = form.getValues("url");
    if (!url) {
      toast.error("Please enter a URL first");
      return;
    }

    setIsParsing(true);
    try {
      const data = await parseItemFromUrl(url);
      const resolvedImageUrl = data.imageUrl
        ? tryResolveScheme(data.imageUrl)
        : "";
      // Update form with parsed data
      if (data.title) form.setValue("title", data.title);
      if (data.description) form.setValue("description", data.description);
      if (data.price) form.setValue("price", data.price);
      if (resolvedImageUrl) form.setValue("imageUrl", resolvedImageUrl);

      if (resolvedImageUrl) {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setUploadedFile(null);
        setPreviewUrl(resolvedImageUrl);
      }

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
      let finalImageUrl = data.imageUrl?.trim() || "";

      const hadUploadedFile = Boolean(uploadedFile);

      if (uploadedFile) {
        try {
          finalImageUrl = await uploadImageToIpfs(uploadedFile);
        } catch (error) {
          console.error("Error uploading image to IPFS:", error);
          toast.error("Image upload failed", {
            description:
              error instanceof Error
                ? error.message
                : "Please ensure the image is 5MB or smaller.",
          });
          return;
        }
      } else if (finalImageUrl) {
        finalImageUrl = tryResolveScheme(finalImageUrl);
      }

      if (hadUploadedFile) {
        setUploadedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }

      if (finalImageUrl) {
        form.setValue("imageUrl", finalImageUrl);
        setPreviewUrl(finalImageUrl);
      } else if (!hadUploadedFile) {
        setPreviewUrl(null);
      }

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
            imageUrl: finalImageUrl,
          }),
        });
      } else {
        response = await fetch(`/api/wishlist/${itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            imageUrl: finalImageUrl,
          }),
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
                <FormDescription>URL to the image</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Upload Image (Optional)</FormLabel>
          <Input
            ref={fileInputRef}
            accept="image/*"
            type="file"
            onChange={handleFileChange}
          />
          <FormDescription>
            Images larger than 5MB will be automatically resized when possible.
          </FormDescription>
          {uploadedFile && (
            <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
              <span className="truncate pr-4">
                {uploadedFile.name} (
                {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
              <Button
                size="sm"
                type="button"
                variant="ghost"
                onClick={handleRemoveUploadedFile}
              >
                Remove
              </Button>
            </div>
          )}
        </div>

        {/* Image Preview */}
        {previewUrl && (
          <div className="space-y-2">
            <FormLabel>Image Preview</FormLabel>
            <div className="border rounded-lg p-4 bg-muted/20">
              <img
                alt="Product preview"
                className="max-w-xs max-h-48 object-contain mx-auto rounded"
                src={previewUrl}
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
              if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
              }
              form.reset();
              setUploadedFile(null);
              setPreviewUrl(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
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
