"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// Form validation schema
const addWishlistItemSchema = z.object({
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

type AddWishlistItemFormValues = z.infer<typeof addWishlistItemSchema>;

// Real function to parse item from URL using our API
const parseItemFromUrl = async (
  url: string,
): Promise<Partial<AddWishlistItemFormValues>> => {
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

    // Convert the API response to our form format
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

export function AddWishlistItemForm() {
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] =
    useState<Partial<AddWishlistItemFormValues> | null>(null);

  const form = useForm<AddWishlistItemFormValues>({
    resolver: zodResolver(addWishlistItemSchema),
    defaultValues: {
      url: "",
      title: "",
      description: "",
      price: "",
      imageUrl: "",
    },
  });

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

  const onSubmit = (data: AddWishlistItemFormValues) => {
    console.log("Wishlist item data:", data);
    toast.success("Item added to wishlist!", {
      description: `${data.title} has been added to your wishlist.`,
    });

    // Reset form
    form.reset();
    setParsedData(null);
  };

  const url = form.watch("url");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Item to Wishlist</CardTitle>
        <CardDescription>
          Paste a link to any product and we'll help you extract the details.
          You can always edit the information before adding to your wishlist.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                      <Input
                        placeholder="https://example.com/product"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleParseUrl}
                      disabled={!url || isParsing}
                    >
                      {isParsing ? "Parsing..." : "Parse"}
                    </Button>
                  </div>
                  <FormDescription>
                    Paste the URL of the product you want to add to your
                    wishlist.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parsed Data Indicator */}
            {parsedData && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <span className="text-lg">✓</span>
                  <span className="font-medium">
                    Item details extracted successfully!
                  </span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Review and edit the details below before adding to your
                  wishlist.
                </p>
              </div>
            )}

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
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0"
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
                    src={form.watch("imageUrl")}
                    alt="Product preview"
                    className="max-w-xs max-h-48 object-contain mx-auto rounded"
                    onError={e => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
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
              <Button type="submit">Add to Wishlist</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
