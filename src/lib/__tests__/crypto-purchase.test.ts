/**
 * Tests for crypto purchase platform URL detection and processing
 * Run these tests with: bun test
 */

import { describe, expect, it } from "bun:test";

import {
  extractAmazonProductId,
  getCryptoPurchaseUrl,
  getMintedMerchMiniAppUrl,
  getWorldstoreUrl,
  isAmazonUrl,
  isMintedMerchUrl,
  supportsCryptoPurchase,
} from "../crypto-purchase";

describe("Amazon (Worldstore) utilities", () => {
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
      expect(isAmazonUrl("https://mintedmerch.shop/products/cap")).toBe(false);
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

    it("should return null for non-Amazon URLs", () => {
      expect(extractAmazonProductId("https://www.example.com")).toBeNull();
      expect(
        extractAmazonProductId("https://mintedmerch.shop/products/cap"),
      ).toBeNull();
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
});

describe("Minted Merch utilities", () => {
  describe("isMintedMerchUrl", () => {
    it("should detect Minted Merch shop URLs", () => {
      expect(
        isMintedMerchUrl("https://mintedmerch.shop/products/bankr-cap"),
      ).toBe(true);
      expect(
        isMintedMerchUrl("https://mintedmerch.shop/products/some-product"),
      ).toBe(true);
    });

    it("should reject non-Minted Merch URLs", () => {
      expect(isMintedMerchUrl("https://www.example.com")).toBe(false);
      expect(isMintedMerchUrl("https://www.amazon.com/dp/B0CSPJTCR5")).toBe(
        false,
      );
      expect(isMintedMerchUrl("https://app.mintedmerch.shop/product/cap")).toBe(
        false,
      );
    });

    it("should handle invalid URLs gracefully", () => {
      expect(isMintedMerchUrl("not a url")).toBe(false);
      expect(isMintedMerchUrl("")).toBe(false);
    });
  });

  describe("getMintedMerchMiniAppUrl", () => {
    it("should convert shop URL to mini app URL", () => {
      const shopUrl = "https://mintedmerch.shop/products/bankr-cap";
      const miniAppUrl = getMintedMerchMiniAppUrl(shopUrl);
      expect(miniAppUrl).toBe("https://app.mintedmerch.shop/product/bankr-cap");
    });

    it("should handle different product slugs", () => {
      expect(
        getMintedMerchMiniAppUrl("https://mintedmerch.shop/products/hat"),
      ).toBe("https://app.mintedmerch.shop/product/hat");
      expect(
        getMintedMerchMiniAppUrl(
          "https://mintedmerch.shop/products/super-cool-shirt",
        ),
      ).toBe("https://app.mintedmerch.shop/product/super-cool-shirt");
    });

    it("should handle URLs with query parameters", () => {
      const url =
        "https://mintedmerch.shop/products/bankr-cap?ref=123&color=blue";
      expect(getMintedMerchMiniAppUrl(url)).toBe(
        "https://app.mintedmerch.shop/product/bankr-cap",
      );
    });

    it("should handle URLs with hash fragments", () => {
      const url = "https://mintedmerch.shop/products/bankr-cap#reviews";
      expect(getMintedMerchMiniAppUrl(url)).toBe(
        "https://app.mintedmerch.shop/product/bankr-cap",
      );
    });

    it("should return null for non-Minted Merch URLs", () => {
      expect(getMintedMerchMiniAppUrl("https://www.example.com")).toBeNull();
      expect(
        getMintedMerchMiniAppUrl("https://www.amazon.com/dp/B0CSPJTCR5"),
      ).toBeNull();
    });

    it("should return null for Minted Merch URLs without /products/ path", () => {
      expect(getMintedMerchMiniAppUrl("https://mintedmerch.shop")).toBeNull();
      expect(
        getMintedMerchMiniAppUrl("https://mintedmerch.shop/about"),
      ).toBeNull();
    });
  });
});

describe("Generic crypto purchase helpers", () => {
  describe("supportsCryptoPurchase", () => {
    it("should return true for Amazon URLs", () => {
      expect(
        supportsCryptoPurchase("https://www.amazon.com/product/dp/B0CSPJTCR5"),
      ).toBe(true);
    });

    it("should return true for Minted Merch URLs", () => {
      expect(
        supportsCryptoPurchase("https://mintedmerch.shop/products/bankr-cap"),
      ).toBe(true);
    });

    it("should return false for unsupported URLs", () => {
      expect(supportsCryptoPurchase("https://www.etsy.com/listing/123")).toBe(
        false,
      );
      expect(supportsCryptoPurchase("https://www.ebay.com/item/456")).toBe(
        false,
      );
    });
  });

  describe("getCryptoPurchaseUrl", () => {
    it("should return Worldstore URL for Amazon products", () => {
      const amazonUrl =
        "https://www.amazon.de/Dollhouse-Purrfect-Playset-Rainbow-Furniture/dp/B0CSPJTCR5";
      expect(getCryptoPurchaseUrl(amazonUrl)).toBe(
        "https://worldstore.crossmint.com/product/B0CSPJTCR5",
      );
    });

    it("should return mini app URL for Minted Merch products", () => {
      const mintedMerchUrl = "https://mintedmerch.shop/products/bankr-cap";
      expect(getCryptoPurchaseUrl(mintedMerchUrl)).toBe(
        "https://app.mintedmerch.shop/product/bankr-cap",
      );
    });

    it("should return null for unsupported URLs", () => {
      expect(
        getCryptoPurchaseUrl("https://www.etsy.com/listing/123"),
      ).toBeNull();
      expect(getCryptoPurchaseUrl("https://www.ebay.com/item/456")).toBeNull();
    });

    it("should return null for Amazon URLs without valid ASIN", () => {
      expect(
        getCryptoPurchaseUrl("https://www.amazon.com/best-sellers"),
      ).toBeNull();
    });

    it("should return null for Minted Merch URLs without product path", () => {
      expect(getCryptoPurchaseUrl("https://mintedmerch.shop/about")).toBeNull();
    });
  });
});

describe("End-to-end flows", () => {
  it("should handle complete Amazon flow", () => {
    const amazonUrl =
      "https://www.amazon.de/Dollhouse-Purrfect-Playset-Rainbow-Furniture/dp/B0CSPJTCR5";

    expect(supportsCryptoPurchase(amazonUrl)).toBe(true);
    expect(isAmazonUrl(amazonUrl)).toBe(true);
    const asin = extractAmazonProductId(amazonUrl);
    expect(asin).toBe("B0CSPJTCR5");
    if (asin) {
      expect(getWorldstoreUrl(asin)).toBe(
        "https://worldstore.crossmint.com/product/B0CSPJTCR5",
      );
    }
    expect(getCryptoPurchaseUrl(amazonUrl)).toBe(
      "https://worldstore.crossmint.com/product/B0CSPJTCR5",
    );
  });

  it("should handle complete Minted Merch flow", () => {
    const mintedMerchUrl = "https://mintedmerch.shop/products/bankr-cap";

    expect(supportsCryptoPurchase(mintedMerchUrl)).toBe(true);
    expect(isMintedMerchUrl(mintedMerchUrl)).toBe(true);
    expect(getMintedMerchMiniAppUrl(mintedMerchUrl)).toBe(
      "https://app.mintedmerch.shop/product/bankr-cap",
    );
    expect(getCryptoPurchaseUrl(mintedMerchUrl)).toBe(
      "https://app.mintedmerch.shop/product/bankr-cap",
    );
  });

  it("should handle unsupported URLs gracefully", () => {
    const unsupportedUrl = "https://www.etsy.com/listing/123456";

    expect(supportsCryptoPurchase(unsupportedUrl)).toBe(false);
    expect(isAmazonUrl(unsupportedUrl)).toBe(false);
    expect(isMintedMerchUrl(unsupportedUrl)).toBe(false);
    expect(getCryptoPurchaseUrl(unsupportedUrl)).toBeNull();
  });
});
