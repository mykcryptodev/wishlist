import {
  CACHE_TTL,
  getBurnEventsCacheKey,
  getBurnLeaderboardCacheKey,
  redis,
} from "./redis";

const PONDER_URL =
  process.env.NEXT_PUBLIC_PONDER_API_URL || "http://localhost:42069";

export type BurnerTotal = {
  staker: string;
  totalBurned: string; // BigInt comes as string from GraphQL
  burnCount: number;
};

export type BurnEvent = {
  id: string;
  staker: string;
  amount: string;
  blockNumber: string;
  timestamp: string;
};

export async function fetchPonderGraphQL<T>(query: string): Promise<T> {
  const res = await fetch(`${PONDER_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`Ponder API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  return json.data;
}

export async function fetchBurnLeaderboard(
  limit: number = 100,
): Promise<BurnerTotal[]> {
  const cacheKey = getBurnLeaderboardCacheKey(limit);

  // Try to get from cache first
  if (redis) {
    try {
      const cached = await redis.get<BurnerTotal[]>(cacheKey);
      if (cached) {
        console.log(
          `[Ponder] Cache hit for burn leaderboard (limit: ${limit})`,
        );
        return cached;
      }
    } catch (error) {
      console.error("[Ponder] Redis cache read error:", error);
      // Continue to fetch from API if cache fails
    }
  }

  const query = `
    query TopBurners {
      burnerTotalss(orderBy: "totalBurned", orderDirection: "desc", limit: ${limit}) {
        items {
          staker
          totalBurned
          burnCount
        }
      }
    }
  `;

  const data = await fetchPonderGraphQL<{
    burnerTotalss: { items: BurnerTotal[] };
  }>(query);

  const results = data.burnerTotalss.items;

  // Cache the results for 5 minutes
  if (redis) {
    try {
      await redis.set(cacheKey, results, { ex: CACHE_TTL.FIVE_MINUTES });
      console.log(
        `[Ponder] Cached burn leaderboard (limit: ${limit}) for ${CACHE_TTL.FIVE_MINUTES}s`,
      );
    } catch (error) {
      console.error("[Ponder] Redis cache write error:", error);
      // Don't throw - caching failure shouldn't break the request
    }
  }

  return results;
}

export async function fetchBurnEvents(
  staker?: string,
  limit: number = 50,
): Promise<BurnEvent[]> {
  const cacheKey = getBurnEventsCacheKey(staker, limit);

  // Try to get from cache first
  if (redis) {
    try {
      const cached = await redis.get<BurnEvent[]>(cacheKey);
      if (cached) {
        console.log(
          `[Ponder] Cache hit for burn events (staker: ${staker || "all"}, limit: ${limit})`,
        );
        return cached;
      }
    } catch (error) {
      console.error("[Ponder] Redis cache read error:", error);
      // Continue to fetch from API if cache fails
    }
  }

  const whereClause = staker ? `where: { staker: "${staker}" }, ` : "";

  const query = `
    query BurnEvents {
      burnEventss(${whereClause}orderBy: "timestamp", orderDirection: "desc", limit: ${limit}) {
        items {
          id
          staker
          amount
          blockNumber
          timestamp
        }
      }
    }
  `;

  const data = await fetchPonderGraphQL<{
    burnEventss: { items: BurnEvent[] };
  }>(query);

  const results = data.burnEventss.items;

  // Cache the results for 5 minutes
  if (redis) {
    try {
      await redis.set(cacheKey, results, { ex: CACHE_TTL.FIVE_MINUTES });
      console.log(
        `[Ponder] Cached burn events (staker: ${staker || "all"}, limit: ${limit}) for ${CACHE_TTL.FIVE_MINUTES}s`,
      );
    } catch (error) {
      console.error("[Ponder] Redis cache write error:", error);
      // Don't throw - caching failure shouldn't break the request
    }
  }

  return results;
}
