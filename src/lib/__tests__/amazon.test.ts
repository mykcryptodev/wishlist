/**
 * Tests for Amazon URL detection and product ID extraction
 * Run these tests with: bun test
 */

import { describe, expect, it } from "bun:test";

import {
  extractAmazonProductId,
  getWorldstoreUrl,
  isAmazonUrl,
} from "../amazon";

describe("Amazon URL utilities", () => {
  describe("isAmazonUrl", () => {
    it("should detect amazon.com URLs", () => {
      expect(isAmazonUrl("https://www.amazon.com/product/dp/B0CSPJTCR5")).toBe(
        true,
      );
    });

    it("should detect international Amazon domains", () => {
      expect(isAmazonUrl("https://www.amazon.de/product/dp/B0CSPJTCR5")).toBe(
        true,
      );
      expect(
        isAmazonUrl("https://www.amazon.co.uk/product/dp/B0CSPJTCR5"),
      ).toBe(true);
      expect(isAmazonUrl("https://www.amazon.ca/product/dp/B0CSPJTCR5")).toBe(
        true,
      );
      expect(isAmazonUrl("https://www.amazon.fr/product/dp/B0CSPJTCR5")).toBe(
        true,
      );
    });

    it("should reject non-Amazon URLs", () => {
      expect(isAmazonUrl("https://www.example.com")).toBe(false);
      expect(isAmazonUrl("https://www.google.com")).toBe(false);
      expect(isAmazonUrl("https://www.ebay.com/item/123")).toBe(false);
    });

    it("should handle invalid URLs gracefully", () => {
      expect(isAmazonUrl("not a url")).toBe(false);
      expect(isAmazonUrl("")).toBe(false);
    });
  });

  describe("extractAmazonProductId", () => {
    it("should extract ASIN from /dp/ URLs", () => {
      const url =
        "https://www.amazon.de/Dollhouse-Purrfect-Playset-Rainbow-Furniture/dp/B0CSPJTCR5";
      expect(extractAmazonProductId(url)).toBe("B0CSPJTCR5");
    });

    it("should extract ASIN from /gp/product/ URLs", () => {
      const url = "https://www.amazon.com/gp/product/B0C651W4PT";
      expect(extractAmazonProductId(url)).toBe("B0C651W4PT");
    });

    it("should extract ASIN with query parameters", () => {
      const url =
        "https://www.amazon.com/product/dp/B0CSPJTCR5?ref=xyz&tag=abc";
      expect(extractAmazonProductId(url)).toBe("B0CSPJTCR5");
    });

    it("should extract ASIN from international domains", () => {
      expect(
        extractAmazonProductId("https://www.amazon.de/product/dp/B0CSPJTCR5"),
      ).toBe("B0CSPJTCR5");
      expect(
        extractAmazonProductId(
          "https://www.amazon.co.uk/product/dp/B0CSPJTCR5",
        ),
      ).toBe("B0CSPJTCR5");
    });

    it("should handle URLs with hash fragments", () => {
      const url =
        "https://www.amazon.com/product/dp/B0CSPJTCR5#customerReviews";
      expect(extractAmazonProductId(url)).toBe("B0CSPJTCR5");
    });

    it("should return null for non-Amazon URLs", () => {
      expect(extractAmazonProductId("https://www.example.com")).toBeNull();
      expect(
        extractAmazonProductId("https://www.ebay.com/item/123"),
      ).toBeNull();
    });

    it("should return null for Amazon URLs without product ID", () => {
      expect(
        extractAmazonProductId("https://www.amazon.com/best-sellers"),
      ).toBeNull();
      expect(extractAmazonProductId("https://www.amazon.com")).toBeNull();
    });

    it("should return null for invalid URLs", () => {
      expect(extractAmazonProductId("not a url")).toBeNull();
      expect(extractAmazonProductId("")).toBeNull();
    });
  });

  describe("getWorldstoreUrl", () => {
    it("should generate correct Worldstore URL", () => {
      expect(getWorldstoreUrl("B0CSPJTCR5")).toBe(
        "https://worldstore.crossmint.com/product/B0CSPJTCR5",
      );
      expect(getWorldstoreUrl("B0C651W4PT")).toBe(
        "https://worldstore.crossmint.com/product/B0C651W4PT",
      );
    });
  });

  describe("End-to-end flow", () => {
    it("should handle complete flow from Amazon URL to Worldstore URL", () => {
      const amazonUrl =
        "https://www.amazon.de/Dollhouse-Purrfect-Playset-Rainbow-Furniture/dp/B0CSPJTCR5";

      // Step 1: Verify it's an Amazon URL
      expect(isAmazonUrl(amazonUrl)).toBe(true);

      // Step 2: Extract product ID
      const productId = extractAmazonProductId(amazonUrl);
      expect(productId).toBe("B0CSPJTCR5");

      // Step 3: Generate Worldstore URL
      if (productId) {
        const worldstoreUrl = getWorldstoreUrl(productId);
        expect(worldstoreUrl).toBe(
          "https://worldstore.crossmint.com/product/B0CSPJTCR5",
        );
      }
    });

    it("should handle non-Amazon URLs gracefully", () => {
      const url = "https://www.etsy.com/listing/123456";

      // Should not be detected as Amazon
      expect(isAmazonUrl(url)).toBe(false);

      // Should not extract product ID
      expect(extractAmazonProductId(url)).toBeNull();
    });
  });
});
