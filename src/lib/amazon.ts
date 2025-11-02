/**
 * Utility functions for Amazon product URL detection and processing
 */

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

