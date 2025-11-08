import { NextResponse } from "next/server";

import { chain } from "@/constants";
import { CACHE_TTL, redis } from "@/lib/redis";
import { getWishlistAddresses } from "@/lib/wishlist-utils";
import { NeynarApiResponse, NeynarUser } from "@/types/neynar";

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

if (!NEYNAR_API_KEY) {
  console.error("NEYNAR_API_KEY is not set");
}

// Batch sizes for Neynar API
const ADDRESS_BATCH_SIZE = 100; // Max addresses per bulk-by-address call
const FID_BATCH_SIZE = 100; // Max FIDs per bulk call

/**
 * GET /api/admin/eligible-addresses
 * Returns deduped eligible addresses based on Neynar score
 *
 * Query params:
 * - minScore: minimum Neynar score (0-1), defaults to 0.9
 */
export async function GET(request: Request) {
  if (!NEYNAR_API_KEY) {
    return NextResponse.json(
      { error: "NEYNAR_API_KEY is not configured" },
      { status: 500 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const minScoreParam = searchParams.get("minScore");
    const minScore = minScoreParam !== null ? parseFloat(minScoreParam) : 0.9;

    // Validate minScore
    if (isNaN(minScore) || minScore < 0 || minScore > 1) {
      return NextResponse.json(
        { error: "minScore must be a number between 0 and 1" },
        { status: 400 },
      );
    }

    console.log(
      `[Admin] Fetching eligible addresses with minScore: ${minScore}`,
    );

    // Step 1: Get all wishlist addresses from contract
    const allAddresses = await getWishlistAddresses(chain.id);
    console.log(`[Admin] Found ${allAddresses.length} total addresses`);

    if (allAddresses.length === 0) {
      return NextResponse.json({
        addresses: [],
        totalAddresses: 0,
        eligibleAddresses: 0,
        minScore,
      });
    }

    // Step 2: Fetch Neynar users for all addresses (with batching)
    const addressToUser: Map<string, NeynarUser> = new Map();
    const fidToAddresses: Map<number, string[]> = new Map();

    // Process addresses in batches
    for (let i = 0; i < allAddresses.length; i += ADDRESS_BATCH_SIZE) {
      const batch = allAddresses.slice(i, i + ADDRESS_BATCH_SIZE);
      console.log(
        `[Admin] Processing address batch ${Math.floor(i / ADDRESS_BATCH_SIZE) + 1} of ${Math.ceil(allAddresses.length / ADDRESS_BATCH_SIZE)}`,
      );

      // Check cache first for this batch
      const cachedUsers: Map<string, NeynarUser> = new Map();
      const uncachedAddresses: string[] = [];

      for (const addr of batch) {
        const normalizedAddr = addr.toLowerCase();
        const cacheKey = `neynar:address:${normalizedAddr}`;

        try {
          const cached = await redis?.get<NeynarUser>(cacheKey);
          // Accept cached users even without scores - we'll fetch scores separately
          if (cached && cached.fid) {
            cachedUsers.set(normalizedAddr, cached);
          } else {
            uncachedAddresses.push(addr);
          }
        } catch (error) {
          console.error(`[Admin] Cache error for ${addr}:`, error);
          uncachedAddresses.push(addr);
        }
      }

      console.log(
        `[Admin] Cache: ${cachedUsers.size} hits, ${uncachedAddresses.length} misses`,
      );

      // Fetch uncached addresses from Neynar
      if (uncachedAddresses.length > 0) {
        const url = new URL(
          "https://api.neynar.com/v2/farcaster/user/bulk-by-address",
        );
        for (const addr of uncachedAddresses) {
          url.searchParams.append("addresses", addr);
          url.searchParams.append("address_types", "verified_address");
        }

        try {
          const response = await fetch(url.toString(), {
            headers: {
              "x-api-key": NEYNAR_API_KEY,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("[Admin] Neynar bulk-by-address error:", errorText);
            // Continue with cached data if API fails
            continue;
          }

          const data: NeynarApiResponse = await response.json();

          // Extract users from response
          for (const [address, users] of Object.entries(data)) {
            if (users && users.length > 0) {
              const user = users[0]; // Take first user for address
              const normalizedAddr = address.toLowerCase();
              addressToUser.set(normalizedAddr, user);

              // Track all addresses for this FID
              if (!fidToAddresses.has(user.fid)) {
                fidToAddresses.set(user.fid, []);
              }
              fidToAddresses.get(user.fid)!.push(normalizedAddr);
            }
          }
        } catch (error) {
          console.error("[Admin] Error fetching batch:", error);
          // Continue with other batches
        }
      }

      // Add cached users to maps
      for (const [addr, user] of cachedUsers.entries()) {
        addressToUser.set(addr, user);

        // Track all addresses for this FID
        if (!fidToAddresses.has(user.fid)) {
          fidToAddresses.set(user.fid, []);
        }
        fidToAddresses.get(user.fid)!.push(addr);
      }
    }

    console.log(
      `[Admin] Mapped ${addressToUser.size} addresses to ${fidToAddresses.size} unique FIDs`,
    );

    // Step 3: Fetch scores for all FIDs (with batching)
    const allFids = Array.from(fidToAddresses.keys());

    for (let i = 0; i < allFids.length; i += FID_BATCH_SIZE) {
      const fidBatch = allFids.slice(i, i + FID_BATCH_SIZE);
      console.log(
        `[Admin] Fetching scores for FID batch ${Math.floor(i / FID_BATCH_SIZE) + 1} of ${Math.ceil(allFids.length / FID_BATCH_SIZE)}`,
      );

      const scoreUrl = new URL("https://api.neynar.com/v2/farcaster/user/bulk");
      scoreUrl.searchParams.set("fids", fidBatch.join(","));

      try {
        const scoreResp = await fetch(scoreUrl.toString(), {
          headers: {
            "x-api-key": NEYNAR_API_KEY,
          },
        });

        if (!scoreResp.ok) {
          const errorText = await scoreResp.text();
          console.error("[Admin] Neynar score API error:", errorText);
          continue;
        }

        const scoreData: { users: NeynarUser[] } = await scoreResp.json();

        // Update scores for all users
        for (const scoreUser of scoreData.users) {
          const addresses = fidToAddresses.get(scoreUser.fid) || [];
          const score =
            typeof scoreUser.score === "number" ? scoreUser.score : 0;

          for (const addr of addresses) {
            const user = addressToUser.get(addr);
            if (user) {
              user.score = score;

              // Cache the updated user with score
              const cacheKey = `neynar:address:${addr}`;
              try {
                await redis?.setex(cacheKey, CACHE_TTL.ONE_HOUR, user);
              } catch (error) {
                console.error(`[Admin] Cache write error for ${addr}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.error("[Admin] Error fetching scores:", error);
      }
    }

    // Step 4: Deduplicate by FID and filter by score
    const eligibleAddresses: string[] = [];
    const eligibleUsers: NeynarUser[] = [];
    const processedFids = new Set<number>();

    for (const [addr, user] of addressToUser.entries()) {
      // Skip if we already processed this FID
      if (processedFids.has(user.fid)) {
        continue;
      }
      processedFids.add(user.fid);

      // Check if score meets threshold
      const score = user.score ?? 0;
      if (score < minScore) {
        continue;
      }

      // Get all addresses for this FID
      const addresses = fidToAddresses.get(user.fid) || [];

      // Prefer primary eth address if available
      const primaryAddress =
        user.verified_addresses?.primary?.eth_address?.toLowerCase();
      const selectedAddress =
        primaryAddress && addresses.includes(primaryAddress)
          ? primaryAddress
          : addresses[0];

      eligibleAddresses.push(selectedAddress);
      eligibleUsers.push({ ...user, custody_address: selectedAddress });
    }

    console.log(
      `[Admin] Found ${eligibleAddresses.length} eligible addresses out of ${allAddresses.length}`,
    );

    return NextResponse.json({
      addresses: eligibleAddresses,
      users: eligibleUsers,
      totalAddresses: allAddresses.length,
      eligibleAddresses: eligibleAddresses.length,
      uniqueFids: processedFids.size,
      minScore,
    });
  } catch (error) {
    console.error("[Admin] Error fetching eligible addresses:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch eligible addresses",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
