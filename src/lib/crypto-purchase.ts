/**
 * Utility functions for crypto purchase platform URL detection and processing
 * Supports: Amazon (via Worldstore), Minted Merch
 */

// ============================================================================
// Amazon (via Worldstore)
// ============================================================================

/**
 * Detects if a URL is an Amazon product URL
 * @param url - The URL to check
 * @returns true if the URL is an Amazon product URL
 */
export function isAmazonUrl(url: string): boolean {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes("amazon.");
  } catch {
    return false;
  }
}

/**
 * Extracts the Amazon product ID (ASIN) from an Amazon product URL
 * The ASIN typically appears after /dp/ in the URL path
 * @param url - The Amazon product URL
 * @returns The product ID (ASIN) or null if not found
 */
export function extractAmazonProductId(url: string): string | null {
  if (!isAmazonUrl(url)) return null;

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Match /dp/{ASIN} pattern
    const dpMatch = pathname.match(/\/dp\/([A-Z0-9]{10})/i);
    if (dpMatch) {
      return dpMatch[1];
    }

    // Also check for /gp/product/{ASIN} pattern (alternative Amazon URL format)
    const gpMatch = pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    if (gpMatch) {
      return gpMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Generates the Worldstore mini app URL for an Amazon product
 * @param asin - The Amazon product ID (ASIN)
 * @returns The Worldstore mini app URL
 */
export function getWorldstoreUrl(asin: string): string {
  return `https://worldstore.crossmint.com/product/${asin}`;
}

// ============================================================================
// Minted Merch
// ============================================================================

/**
 * Detects if a URL is a Minted Merch shop URL
 * @param url - The URL to check
 * @returns true if the URL is a Minted Merch product URL
 */
export function isMintedMerchUrl(url: string): boolean {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === "mintedmerch.shop";
  } catch {
    return false;
  }
}

/**
 * Converts a Minted Merch shop URL to the mini app URL
 * Example: https://mintedmerch.shop/products/bankr-cap
 *       -> https://app.mintedmerch.shop/product/bankr-cap
 * @param url - The Minted Merch shop URL
 * @returns The Minted Merch mini app URL, or null if invalid
 */
export function getMintedMerchMiniAppUrl(url: string): string | null {
  if (!isMintedMerchUrl(url)) return null;

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Match /products/{product-slug} pattern
    const match = pathname.match(/\/products\/([^/?#]+)/i);
    if (!match) return null;

    const productSlug = match[1];

    // Convert to mini app URL format
    // Change domain: mintedmerch.shop -> app.mintedmerch.shop
    // Change path: /products/ -> /product/ (singular)
    return `https://app.mintedmerch.shop/product/${productSlug}`;
  } catch {
    return null;
  }
}

// ============================================================================
// Generic helpers
// ============================================================================

/**
 * Checks if a URL supports crypto purchase via mini app
 * @param url - The URL to check
 * @returns true if the URL supports crypto purchase
 */
export function supportsCryptoPurchase(url: string): boolean {
  return isAmazonUrl(url) || isMintedMerchUrl(url);
}

/**
 * Gets the crypto purchase mini app URL for a given product URL
 * @param url - The product URL
 * @returns The mini app URL for crypto purchase, or null if not supported
 */
export function getCryptoPurchaseUrl(url: string): string | null {
  // Try Amazon
  if (isAmazonUrl(url)) {
    const asin = extractAmazonProductId(url);
    return asin ? getWorldstoreUrl(asin) : null;
  }

  // Try Minted Merch
  if (isMintedMerchUrl(url)) {
    return getMintedMerchMiniAppUrl(url);
  }

  return null;
}
