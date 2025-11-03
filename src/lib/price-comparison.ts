/**
 * Price Comparison Utilities
 *
 * Uses Google Shopping (via SerpAPI) to find cheapest prices for products
 */

interface ProductInfo {
  title: string;
  brand?: string;
  searchQuery: string;
}

interface PriceResult {
  name: string;
  price: number;
  url: string;
  savings: number;
  source: string;
  thumbnail?: string;
  shipping?: string;
  rating?: number;
}

interface ComparisonResults {
  cheapestPrice: number;
  stores: PriceResult[];
  comparedAt: string;
}

/**
 * Extract product information from wishlist item
 * Uses the URL and title to build a good search query
 */
export function extractProductInfo(item: {
  title: string;
  url: string;
  description: string;
}): ProductInfo {
  const title = item.title.trim();

  // Try to extract brand from URL or title
  let brand: string | undefined;

  // Extract brand from title (common patterns like "Brand - Product Name")
  const brandMatch = title.match(/^([A-Z][a-zA-Z0-9&\s]+?)[\s-]+/);
  if (brandMatch) {
    brand = brandMatch[1].trim();
  }

  // Create search query - clean up common noise words
  let searchQuery = title
    .replace(/\s+/g, " ")
    .replace(/\[.*?\]/g, "") // Remove brackets
    .replace(/\(.*?\)/g, "") // Remove parentheses
    .trim();

  // If the query is too long, truncate to first 100 chars
  if (searchQuery.length > 100) {
    searchQuery = searchQuery.substring(0, 100).trim();
  }

  return {
    title,
    brand,
    searchQuery,
  };
}

/**
 * Search Google Shopping using SerpAPI
 * Requires SERPAPI_KEY environment variable
 */
export async function searchGoogleShopping(
  productInfo: ProductInfo,
  originalPrice?: number,
): Promise<ComparisonResults> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    throw new Error("SERPAPI_KEY environment variable is required");
  }

  // Build SerpAPI request
  const params = new URLSearchParams({
    engine: "google_shopping",
    q: productInfo.searchQuery,
    api_key: apiKey,
    // Additional parameters for better results
    num: "20", // Get more results for better comparison
    hl: "en", // Language
    gl: "us", // Country
  });

  const url = `https://serpapi.com/search?${params.toString()}`;

  console.log("Searching Google Shopping for:", productInfo.searchQuery);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `SerpAPI request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  // Parse shopping results
  const results = parseShoppingResults(data, originalPrice);

  return results;
}

/**
 * Parse SerpAPI Google Shopping response into our format
 */
function parseShoppingResults(
  data: any,
  originalPrice?: number,
): ComparisonResults {
  const shoppingResults = data.shopping_results || [];

  if (shoppingResults.length === 0) {
    throw new Error("No shopping results found for this product");
  }

  // Convert to our format
  const stores: PriceResult[] = shoppingResults
    .map((result: any) => {
      // Parse price - handle different formats
      let price = 0;
      if (typeof result.price === "string") {
        // Remove currency symbols and parse
        price = parseFloat(result.price.replace(/[^0-9.]/g, ""));
      } else if (typeof result.extracted_price === "number") {
        price = result.extracted_price;
      }

      // Skip if price is invalid
      if (!price || isNaN(price) || price <= 0) {
        return null;
      }

      // Calculate savings if original price provided
      const savings = originalPrice ? Math.max(0, originalPrice - price) : 0;

      return {
        name: result.source || "Unknown Store",
        price,
        url: result.link || "",
        savings,
        source: result.source || "Unknown",
        thumbnail: result.thumbnail,
        shipping: result.delivery || result.shipping,
        rating: result.rating,
      };
    })
    .filter((r: any) => r !== null) as PriceResult[];

  // Sort by price (cheapest first)
  stores.sort((a, b) => a.price - b.price);

  // Take top 5 results
  const topStores = stores.slice(0, 5);

  if (topStores.length === 0) {
    throw new Error("No valid prices found in shopping results");
  }

  const cheapestPrice = topStores[0].price;

  // Recalculate savings based on cheapest price for consistency
  topStores.forEach(store => {
    if (originalPrice) {
      store.savings = Math.max(0, originalPrice - store.price);
    }
  });

  return {
    cheapestPrice,
    stores: topStores,
    comparedAt: new Date().toISOString(),
  };
}

/**
 * Alternative: Use OpenGraph scraping + simple Google search
 * This is a fallback if SerpAPI is not available
 */
export async function extractOpenGraphData(url: string): Promise<{
  title?: string;
  description?: string;
  image?: string;
  price?: string;
}> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();

    // Simple regex-based OG tag extraction
    const ogData: any = {};

    const titleMatch = html.match(
      /<meta property="og:title" content="([^"]+)"/i,
    );
    if (titleMatch) ogData.title = titleMatch[1];

    const descMatch = html.match(
      /<meta property="og:description" content="([^"]+)"/i,
    );
    if (descMatch) ogData.description = descMatch[1];

    const imageMatch = html.match(
      /<meta property="og:image" content="([^"]+)"/i,
    );
    if (imageMatch) ogData.image = imageMatch[1];

    const priceMatch = html.match(
      /<meta property="og:price:amount" content="([^"]+)"/i,
    );
    if (priceMatch) ogData.price = priceMatch[1];

    return ogData;
  } catch (error) {
    console.error("Failed to extract OpenGraph data:", error);
    return {};
  }
}
