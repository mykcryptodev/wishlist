import { NextRequest, NextResponse } from "next/server";

interface ParsedItem {
  title?: string;
  description?: string;
  price?: string;
  imageUrl?: string;
  url: string;
}

// Function to extract Open Graph and meta tags from HTML
function extractMetaTags(html: string, url: string): ParsedItem {
  const result: ParsedItem = { url };

  // Extract title - try multiple methods
  const titlePatterns = [
    /<title[^>]*>([^<]+)<\/title>/i,
    /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
  ];

  for (const pattern of titlePatterns) {
    const match = html.match(pattern);
    if (match) {
      result.title = match[1].trim();
      break;
    }
  }

  // Extract description - try multiple methods
  const descPatterns = [
    /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
  ];

  for (const pattern of descPatterns) {
    const match = html.match(pattern);
    if (match) {
      result.description = match[1].trim();
      break;
    }
  }

  // Extract image - try multiple methods
  const imgPatterns = [
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*property=["']og:image:url["'][^>]*content=["']([^"']+)["'][^>]*>/i,
  ];

  for (const pattern of imgPatterns) {
    const match = html.match(pattern);
    if (match) {
      let imageUrl = match[1].trim();
      // Convert relative URLs to absolute
      if (imageUrl.startsWith("/")) {
        const urlObj = new URL(url);
        imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
      } else if (!imageUrl.startsWith("http")) {
        const urlObj = new URL(url);
        imageUrl = `${urlObj.protocol}//${urlObj.host}/${imageUrl}`;
      }
      result.imageUrl = imageUrl;
      break;
    }
  }

  // Extract price using various patterns
  const pricePatterns = [
    /<meta[^>]*property=["']product:price:amount["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*name=["']price["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*property=["']product:price:currency["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<span[^>]*class=["'][^"']*price[^"']*["'][^>]*>([^<]+)<\/span>/i,
    /<div[^>]*class=["'][^"']*price[^"']*["'][^>]*>([^<]+)<\/div>/i,
    /\$(\d+(?:\.\d{2})?)/g,
    /(\d+(?:\.\d{2})?)\s*USD/g,
    /Price:\s*\$?(\d+(?:\.\d{2})?)/i,
  ];

  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match) {
      let price = match[1] || match[0];
      // Clean up price string
      price = price.replace(/[^\d.]/g, "");
      if (price && !isNaN(parseFloat(price)) && parseFloat(price) > 0) {
        result.price = parseFloat(price).toFixed(2);
        break;
      }
    }
  }

  return result;
}

// Function to scrape website content with better error handling
async function scrapeUrl(url: string): Promise<ParsedItem> {
  try {
    // First, try to fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0",
      },
      // Add timeout
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return extractMetaTags(html, url);
  } catch (error) {
    console.error("Error scraping URL:", error);

    // If scraping fails, try to return basic info from URL
    const urlObj = new URL(url);
    return {
      url,
      title: `Item from ${urlObj.hostname}`,
      description: `Product from ${urlObj.hostname}`,
    };
  }
}

// Function to parse specific e-commerce sites with better accuracy
async function parseEcommerceSite(url: string): Promise<ParsedItem> {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();

  // For major e-commerce sites, we can use more specific parsing
  if (hostname.includes("amazon")) {
    return parseAmazon(url);
  } else if (hostname.includes("apple.com")) {
    return parseApple(url);
  } else if (hostname.includes("target.com")) {
    return parseTarget(url);
  } else if (hostname.includes("bestbuy.com")) {
    return parseBestBuy(url);
  } else if (hostname.includes("walmart.com")) {
    return parseWalmart(url);
  }

  // Fallback to general scraping
  return scrapeUrl(url);
}

// Amazon-specific parsing
async function parseAmazon(url: string): Promise<ParsedItem> {
  const result = await scrapeUrl(url);

  // Amazon-specific enhancements
  if (result.title && result.title.includes("Amazon.com")) {
    // Try to extract product name from title
    const titleMatch = result.title.match(/Amazon\.com: (.+?) :/);
    if (titleMatch) {
      result.title = titleMatch[1].trim();
    }
  }

  return result;
}

// Apple-specific parsing
async function parseApple(url: string): Promise<ParsedItem> {
  const result = await scrapeUrl(url);

  // Apple products often have clean titles
  if (result.title && result.title.includes("Apple")) {
    // Clean up Apple titles
    result.title = result.title.replace(/^Apple - /, "").trim();
  }

  return result;
}

// Target-specific parsing
async function parseTarget(url: string): Promise<ParsedItem> {
  const result = await scrapeUrl(url);

  // Target-specific enhancements
  if (result.title && result.title.includes("Target")) {
    // Remove "Target" from title
    result.title = result.title.replace(/ - Target$/, "").trim();
  }

  return result;
}

// Best Buy-specific parsing
async function parseBestBuy(url: string): Promise<ParsedItem> {
  const result = await scrapeUrl(url);

  // Best Buy-specific enhancements
  if (result.title && result.title.includes("Best Buy")) {
    result.title = result.title.replace(/ - Best Buy$/, "").trim();
  }

  return result;
}

// Walmart-specific parsing
async function parseWalmart(url: string): Promise<ParsedItem> {
  const result = await scrapeUrl(url);

  // Walmart-specific enhancements
  if (result.title && result.title.includes("Walmart")) {
    result.title = result.title.replace(/ - Walmart\.com$/, "").trim();
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 },
      );
    }

    // Parse the URL
    const parsedItem = await parseEcommerceSite(url);

    return NextResponse.json(parsedItem);
  } catch (error) {
    console.error("Error parsing URL:", error);

    return NextResponse.json(
      {
        error: "Failed to parse URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
