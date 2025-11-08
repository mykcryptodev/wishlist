import { NextResponse } from "next/server";

import { chain, weth } from "@/constants";
import { CACHE_TTL, getEthereumPriceCacheKey, redis } from "@/lib/redis";

const CACHE_KEY = getEthereumPriceCacheKey();
const COINGECKO_API_URL =
  "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=ethereum";
const WETH_ADDRESS = weth[chain.id];

interface CoinGeckoResponse {
  ethereum: {
    usd: number;
  };
}

interface ThirdwebTokenResponse {
  result: {
    tokens: Array<{
      priceUsd: number;
    }>;
  };
}

interface EthereumPriceResponse {
  price: number;
  timestamp: number;
  source: "cache" | "coingecko" | "thirdweb";
}

/**
 * Fallback: Fetch WETH price from Thirdweb API
 */
async function fetchFromThirdweb(): Promise<number> {
  console.log("[Ethereum Price] Fetching from Thirdweb API (fallback)");
  const apiUrl = new URL("https://api.thirdweb.com/v1/tokens");
  apiUrl.searchParams.set("chainId", chain.id.toString());
  apiUrl.searchParams.set("tokenAddress", WETH_ADDRESS);
  apiUrl.searchParams.set("limit", "1");

  const response = await fetch(apiUrl.toString(), {
    headers: {
      "x-secret-key": process.env.THIRDWEB_SECRET_KEY || "",
    },
  });

  if (!response.ok) {
    throw new Error(`Thirdweb API error: ${response.status}`);
  }

  const data: ThirdwebTokenResponse = await response.json();
  const token = data.result?.tokens?.[0];

  if (!token || !token.priceUsd) {
    throw new Error("No price data available from Thirdweb");
  }

  return token.priceUsd;
}

export async function GET() {
  try {
    // Try to get from Redis cache first
    if (redis) {
      const cachedData = await redis.get<EthereumPriceResponse>(CACHE_KEY);

      if (cachedData) {
        console.log("[Ethereum Price] Serving from cache");
        return NextResponse.json({
          ...cachedData,
          source: "cache",
        });
      }
    }

    // Cache miss or Redis not configured - fetch from CoinGecko
    let price: number;
    let source: "coingecko" | "thirdweb" = "coingecko";

    try {
      console.log("[Ethereum Price] Cache miss, fetching from CoinGecko API");
      const response = await fetch(COINGECKO_API_URL, {
        headers: {
          Accept: "application/json",
        },
      });

      // If rate limited (429), fall back to Thirdweb
      if (response.status === 429) {
        console.warn(
          "[Ethereum Price] CoinGecko rate limit hit, falling back to Thirdweb",
        );
        price = await fetchFromThirdweb();
        source = "thirdweb";
      } else if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      } else {
        const data: CoinGeckoResponse = await response.json();
        price = data.ethereum.usd;
      }
    } catch (error) {
      // If CoinGecko fails for any reason, try Thirdweb as fallback
      console.error("[Ethereum Price] CoinGecko error:", error);
      console.log("[Ethereum Price] Attempting Thirdweb fallback");
      try {
        price = await fetchFromThirdweb();
        source = "thirdweb";
      } catch (fallbackError) {
        console.error(
          "[Ethereum Price] Thirdweb fallback also failed:",
          fallbackError,
        );
        throw new Error("Both CoinGecko and Thirdweb APIs failed");
      }
    }

    const timestamp = Date.now();
    const result: EthereumPriceResponse = {
      price,
      timestamp,
      source,
    };

    // Store in Redis with 30 second TTL
    if (redis) {
      await redis.setex(CACHE_KEY, CACHE_TTL.THIRTY_SECONDS, result);
      console.log(
        `[Ethereum Price] Cached price $${price} from ${source} with ${CACHE_TTL.THIRTY_SECONDS}s TTL`,
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Ethereum Price] Error fetching price:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch Ethereum price",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
