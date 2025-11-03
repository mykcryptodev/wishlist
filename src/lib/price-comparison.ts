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

  // Create search query - clean up common noise words and overly descriptive terms
  let searchQuery = title
    .replace(/\s+/g, " ")
    .replace(/\[.*?\]/g, "") // Remove brackets
    .replace(/\(.*?\)/g, "") // Remove parentheses
    .trim();

  // Remove overly descriptive/generic words that hurt search quality
  const noiseWords = [
    "Activated",
    "Integrated",
    "Enhanced",
    "Premium",
    "Professional",
    "Advanced",
    "Ultimate",
    "Edition",
    "Version",
  ];

  noiseWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    searchQuery = searchQuery.replace(regex, "").replace(/\s+/g, " ").trim();
  });

  // If the query is still too long, use smart truncation
  if (searchQuery.length > 60) {
    // Try to keep: Brand + Key Product Type + Model
    // Example: "Ring Smart Lighting Solar LED Pathlight" instead of full title
    const words = searchQuery.split(" ");

    // Keep first 6-8 most important words
    if (words.length > 8) {
      searchQuery = words.slice(0, 8).join(" ");
    }
  }

  return {
    title,
    brand,
    searchQuery,
  };
}

/**
 * Search Google Shopping using SerpAPI directly
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
    num: "20", // Get more results for better comparison
    hl: "en", // Language
    gl: "us", // Country
  });

  const url = `https://serpapi.com/search?${params.toString()}`;

  console.log("🔍 Google Shopping Search:");
  console.log("  - Original title:", productInfo.title);
  console.log("  - Optimized query:", productInfo.searchQuery);
  console.log("  - Brand:", productInfo.brand || "not detected");

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

  // Get search query from the response for relevance checking
  const searchQuery = (data.search_parameters?.q || "").toLowerCase();
  const searchWords = searchQuery
    .split(" ")
    .filter((w: string) => w.length > 2);

  // Extended type for relevance scoring
  type ScoredResult = PriceResult & { relevanceScore: number };

  // Convert to our format
  const stores: ScoredResult[] = shoppingResults
    .map((result: any): ScoredResult | null => {
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

      // Skip if price is suspiciously low (likely not the right product)
      if (price < 1) {
        return null;
      }

      // Calculate savings if original price provided
      const savings = originalPrice ? Math.max(0, originalPrice - price) : 0;

      // Calculate relevance score based on title match
      const resultTitle = (result.title || "").toLowerCase();
      let relevanceScore = 0;

      // Check how many search words appear in the result title
      searchWords.forEach((word: string) => {
        if (resultTitle.includes(word)) {
          relevanceScore += 1;
        }
      });

      // Boost score if exact source match
      const searchSource = searchWords[0]; // Usually the brand
      if (
        searchSource &&
        (result.source || "").toLowerCase().includes(searchSource)
      ) {
        relevanceScore += 2;
      }

      return {
        name: result.source || "Unknown Store",
        price,
        url: result.link || "",
        savings,
        source: result.source || "Unknown",
        thumbnail: result.thumbnail,
        shipping: result.delivery || result.shipping,
        rating: result.rating,
        relevanceScore,
      };
    })
    .filter((r: ScoredResult | null): r is ScoredResult => r !== null);

  // Filter out results with very low relevance (less than 20% of search terms)
  const minRelevance = Math.max(1, Math.floor(searchWords.length * 0.2));
  const relevantStores = stores.filter(
    store => store.relevanceScore >= minRelevance,
  );

  // Use relevant stores if we have enough, otherwise fall back to all
  const filteredStores = relevantStores.length >= 3 ? relevantStores : stores;

  console.log(
    `📊 Relevance filtering: ${stores.length} total → ${relevantStores.length} relevant (min score: ${minRelevance})`,
  );

  // Sort by PRICE first (cheapest first), then by relevance as tiebreaker
  // For a price comparison feature, users want cheapest prices!
  filteredStores.sort((a, b) => {
    // Prioritize price (cheapest first)
    if (a.price !== b.price) {
      return a.price - b.price;
    }
    // Use relevance as tiebreaker for same-price items
    return b.relevanceScore - a.relevanceScore;
  });

  // Take top 5 results
  const topStores = filteredStores.slice(0, 5).map(store => {
    // Remove the relevanceScore before returning
    const { relevanceScore, ...cleanStore } = store;
    return cleanStore;
  });

  if (topStores.length === 0) {
    throw new Error("No valid prices found in shopping results");
  }

  const cheapestPrice = Math.min(...topStores.map(s => s.price));

  // Recalculate savings based on original price if provided
  topStores.forEach(store => {
    if (originalPrice && originalPrice > 0 && originalPrice < 1000000) {
      store.savings = Math.max(0, originalPrice - store.price);
    } else {
      // If no valid original price, show savings vs cheapest option
      store.savings = store.price - cheapestPrice;
    }
  });

  console.log(
    `✅ Returning ${topStores.length} results, cheapest: $${cheapestPrice}`,
  );
  topStores.forEach((store, idx) => {
    console.log(
      `   ${idx + 1}. ${store.name}: $${store.price} (score was included in sort)`,
    );
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
