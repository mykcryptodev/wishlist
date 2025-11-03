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
  installment?: {
    monthlyPrice: number;
    months: number;
  };
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
  const description = item.description?.trim() || "";

  // Try to extract brand from URL or title
  let brand: string | undefined;

  // Extract brand from title (common patterns like "Brand - Product Name")
  const brandMatch = title.match(/^([A-Z][a-zA-Z0-9&\s]+?)[\s-]+/);
  if (brandMatch) {
    brand = brandMatch[1].trim();
  }

  // Try to extract model number from description (like "Model: ABC-123" or "SKU: XYZ")
  const modelMatch = description.match(
    /(?:model|sku|part\s*#?)[:\s]+([A-Z0-9-]+)/i,
  );
  const modelNumber = modelMatch ? modelMatch[1].trim() : "";

  // Build search query starting with title
  let searchQuery = title
    .replace(/\s+/g, " ")
    .replace(/\[.*?\]/g, "") // Remove brackets
    .replace(/\(.*?\)/g, "") // Remove parentheses
    .trim();

  // Append model number if found (helps with exact matches)
  if (modelNumber && !searchQuery.includes(modelNumber)) {
    searchQuery = `${searchQuery} ${modelNumber}`.trim();
  }

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
    engine: "google_shopping_light",
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

  // Check if model number was extracted from description
  const hasModelInQuery =
    productInfo.searchQuery !==
    productInfo.title
      .replace(/\s+/g, " ")
      .replace(/\[.*?\]/g, "")
      .replace(/\(.*?\)/g, "")
      .trim();
  if (hasModelInQuery) {
    console.log("  - Enhanced with model number from description");
  }

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

  // Store the search query for fallback URLs
  const fallbackSearchQuery = searchQuery;

  // Extended type for relevance scoring
  type ScoredResult = PriceResult & { relevanceScore: number };

  console.log("🔍 Shopping Results:", JSON.stringify(shoppingResults));

  // Convert to our format
  const stores: ScoredResult[] = shoppingResults
    .map((result: any): ScoredResult | null => {
      // Parse price - handle installment pricing
      let price = 0;
      let installmentInfo: { monthlyPrice: number; months: number } | undefined;

      // Check if this is an installment price
      if (result.installment && result.installment.period) {
        // Calculate total price: monthly payment × number of months
        const monthlyPrice = result.installment.extracted_price || 0;
        const months = result.installment.period || 0;
        price = monthlyPrice * months;
        installmentInfo = { monthlyPrice, months };
        console.log(
          `Installment pricing: $${monthlyPrice}/mo × ${months} months = $${price} total`,
        );
      } else if (typeof result.price === "string") {
        // Regular price - remove currency symbols and parse
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

      // SerpAPI can return URLs in different fields - check them all
      let url =
        result.link || result.product_link || result.serpapi_product_api || "";

      // Ensure URL has protocol (some results might be missing it)
      if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }

      // If still no URL, log the entire result to debug
      if (!url || url.trim() === "") {
        console.warn(
          `No URL found for: ${result.source} - $${price}`,
          "Available fields:",
          Object.keys(result),
        );
        // Don't skip - use a fallback Google search URL
        url = `https://www.google.com/search?q=${encodeURIComponent(
          `${result.source} ${result.title || fallbackSearchQuery}`,
        )}`;
        console.log(`   → Using fallback URL: ${url.substring(0, 80)}...`);
      }

      return {
        name: result.source || "Unknown Store",
        price,
        url,
        savings,
        source: result.source || "Unknown",
        thumbnail: result.thumbnail,
        shipping: result.delivery || result.shipping,
        rating: result.rating,
        installment: installmentInfo, // Include installment info if present
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
    console.log(`   ${idx + 1}. ${store.name}: $${store.price}`);
    console.log(`      URL: ${store.url.substring(0, 100)}...`);
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
