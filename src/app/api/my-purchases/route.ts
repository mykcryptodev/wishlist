import { NextRequest, NextResponse } from "next/server";
import { isAddressEqual } from "viem";

import { chain, multisig, wishlist } from "@/constants";
import {
  CACHE_TTL,
  getMyPurchasesCacheKey,
  redis,
  shouldUseCache,
} from "@/lib/redis";
import { ContractCall, thirdwebReadContract } from "@/lib/thirdweb-http-api";

export const dynamic = "force-dynamic";

interface PurchaseItem {
  id: string;
  owner: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  price: string;
  exists: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MyPurchasesResponse {
  success: true;
  items: PurchaseItem[];
  count: number;
  totalItems: number;
  offset?: number;
  limit?: number;
}

/**
 * Get all items that the user is signed up to purchase
 *
 * GET /api/my-purchases?userAddress=<address>
 *
 * Returns all wishlist items where the user is a purchaser,
 * along with the item owner information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");
    const offsetParam = searchParams.get("offset");
    const limitParam = searchParams.get("limit");

    const offset = Math.max(0, Number(offsetParam ?? 0));
    const limit = Math.max(0, Number(limitParam ?? 0));
    const usePagination = limit > 0;

    if (!userAddress) {
      return NextResponse.json(
        { error: "Missing userAddress parameter" },
        { status: 400 },
      );
    }

    const normalizedUserAddress = userAddress.toLowerCase();
    const wishFundAddress = multisig[chain.id];
    const isWishFundAddress = !!(
      wishFundAddress &&
      isAddressEqual(
        wishFundAddress as `0x${string}`,
        userAddress as `0x${string}`,
      )
    );
    const shouldCacheWishFund = isWishFundAddress && shouldUseCache(chain.id);

    // For multisig address, check cache first
    if (shouldCacheWishFund && redis) {
      // Check for paginated cache first
      if (usePagination) {
        const paginatedCacheKey = getMyPurchasesCacheKey(
          chain.id,
          normalizedUserAddress,
          offset,
          limit,
        );
        try {
          const cachedPaginatedResponse = (await redis.get(
            paginatedCacheKey,
          )) as MyPurchasesResponse | null;
          if (cachedPaginatedResponse) {
            console.log(
              `[My Purchases] Returning cached paginated Wish Fund data for ${normalizedUserAddress} (offset: ${offset}, limit: ${limit})`,
            );
            return NextResponse.json(cachedPaginatedResponse);
          }
        } catch (error) {
          console.error("[My Purchases] Redis cache read error:", error);
        }
      }

      // Check for full dataset cache
      const fullCacheKey = getMyPurchasesCacheKey(
        chain.id,
        normalizedUserAddress,
      );
      try {
        const cachedFullResponse = (await redis.get(
          fullCacheKey,
        )) as MyPurchasesResponse | null;
        if (cachedFullResponse) {
          console.log(
            `[My Purchases] Found cached full Wish Fund data for ${normalizedUserAddress}`,
          );

          // If paginated request, slice the cached data
          if (usePagination && cachedFullResponse.items) {
            const allItems = cachedFullResponse.items;
            const paginatedItems = allItems.slice(offset, offset + limit);
            const paginatedResponse: MyPurchasesResponse = {
              ...cachedFullResponse,
              items: paginatedItems,
              count: paginatedItems.length,
              offset,
              limit,
            };

            // Cache the paginated result for faster future access
            const paginatedCacheKey = getMyPurchasesCacheKey(
              chain.id,
              normalizedUserAddress,
              offset,
              limit,
            );
            try {
              await redis.set(paginatedCacheKey, paginatedResponse, {
                ex: CACHE_TTL.ONE_DAY,
              });
            } catch (error) {
              console.error("[My Purchases] Redis cache write error:", error);
            }

            return NextResponse.json(paginatedResponse);
          }

          // Non-paginated request, return full cached data
          return NextResponse.json(cachedFullResponse);
        }
      } catch (error) {
        console.error("[My Purchases] Redis cache read error:", error);
      }
    }

    // Get total number of items
    const totalItemsResult = await thirdwebReadContract(
      [
        {
          contractAddress: wishlist[chain.id],
          method: "function getTotalItems() view returns (uint256)",
          params: [],
        },
      ],
      chain.id,
    );

    const totalItems =
      Number(
        totalItemsResult.result[0].data || totalItemsResult.result[0].result,
      ) || 0;

    if (usePagination && offset >= totalItems) {
      return NextResponse.json({
        success: true,
        items: [],
        count: 0,
        totalItems,
        offset,
        limit,
      });
    }

    console.log(
      `[My Purchases] Total items: ${totalItems}, checking for user: ${userAddress}`,
    );

    // For multisig address, always fetch all items to cache the full dataset
    // For other addresses, only fetch requested range
    const shouldFetchAll = isWishFundAddress && shouldCacheWishFund;
    const startItemId = shouldFetchAll ? 1 : usePagination ? offset + 1 : 1;
    const endItemId = shouldFetchAll
      ? totalItems
      : usePagination
        ? Math.min(totalItems, offset + limit)
        : totalItems;

    // Check each item to see if user is a purchaser
    // NOTE: The contract doesn't support reverse lookups (no getItemsByPurchaser method),
    // so we must check all items. This is inefficient but necessary. However:
    // 1. We batch all calls into a single API request (1 call instead of N calls)
    // 2. Results are cached for 24 hours, so subsequent requests use cache
    // 3. This full check only happens on cache miss
    // Batch all calls into a single API request to avoid rate limits
    const batchCalls: ContractCall[] = [];
    for (let itemId = startItemId; itemId <= endItemId; itemId++) {
      batchCalls.push({
        contractAddress: wishlist[chain.id],
        method:
          "function checkIsPurchaser(uint256,address) view returns (bool)",
        params: [itemId.toString(), userAddress],
      });
    }

    // Make a single batched API call instead of many individual calls
    const batchResult = await thirdwebReadContract(batchCalls, chain.id);
    const checkResults = batchResult.result.map((result, index) => ({
      itemId: startItemId + index,
      isPurchaser: result.data || result.result,
    }));
    const purchasingItemIds = checkResults
      .filter(r => r.isPurchaser === true)
      .map(r => r.itemId);

    console.log(
      `[My Purchases] User is purchasing ${purchasingItemIds.length} items:`,
      purchasingItemIds,
    );

    // If no items, return empty array
    if (purchasingItemIds.length === 0) {
      const emptyResponse = {
        success: true,
        items: [],
        count: 0,
        totalItems,
        offset,
        limit: usePagination ? limit : undefined,
      } as const;

      // Cache empty response for multisig address
      if (shouldCacheWishFund && redis) {
        try {
          // Cache full empty dataset
          const fullCacheKey = getMyPurchasesCacheKey(
            chain.id,
            normalizedUserAddress,
          );
          const fullEmptyResponse = {
            success: true,
            items: [],
            count: 0,
            totalItems,
          };
          await redis.set(fullCacheKey, fullEmptyResponse, {
            ex: CACHE_TTL.ONE_DAY,
          });

          // If paginated, also cache paginated empty response
          if (usePagination) {
            const paginatedCacheKey = getMyPurchasesCacheKey(
              chain.id,
              normalizedUserAddress,
              offset,
              limit,
            );
            await redis.set(paginatedCacheKey, emptyResponse, {
              ex: CACHE_TTL.ONE_DAY,
            });
          }
        } catch (error) {
          console.error("[My Purchases] Redis cache write error:", error);
        }
      }

      return NextResponse.json(emptyResponse);
    }

    // Fetch full details for items user is purchasing
    // Batch all getItem calls into a single API request
    const itemDetailsCalls: ContractCall[] = purchasingItemIds.map(itemId => ({
      contractAddress: wishlist[chain.id],
      method:
        "function getItem(uint256) view returns ((uint256,address,string,string,string,string,uint256,bool,uint256,uint256))",
      params: [itemId.toString()],
    }));

    const itemDetailsBatchResult = await thirdwebReadContract(
      itemDetailsCalls,
      chain.id,
    );

    const items = itemDetailsBatchResult.result
      .map(result => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const itemData: any = result.data || result.result;

        // Skip failed decodings
        if (!itemData) {
          return null;
        }

        // Handle both array and object formats
        if (Array.isArray(itemData)) {
          return {
            id: itemData[0]?.toString(),
            owner: itemData[1],
            title: itemData[2],
            description: itemData[3],
            url: itemData[4],
            imageUrl: itemData[5],
            price: itemData[6]?.toString(),
            exists: itemData[7],
            createdAt: itemData[8]?.toString(),
            updatedAt: itemData[9]?.toString(),
          };
        } else {
          return {
            id: itemData.id?.toString() || itemData[0]?.toString(),
            owner: itemData.owner || itemData[1],
            title: itemData.title || itemData[2],
            description: itemData.description || itemData[3],
            url: itemData.url || itemData[4],
            imageUrl: itemData.imageUrl || itemData[5],
            price: itemData.price?.toString() || itemData[6]?.toString(),
            exists: itemData.exists ?? itemData[7],
            createdAt:
              itemData.createdAt?.toString() || itemData[8]?.toString(),
            updatedAt:
              itemData.updatedAt?.toString() || itemData[9]?.toString(),
          };
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // Filter out any items that don't exist
    const existingItems = items.filter(item => item.exists);

    console.log(`[My Purchases] Returning ${existingItems.length} items`);

    // For multisig address, cache the full dataset
    if (shouldCacheWishFund && redis && shouldFetchAll) {
      const fullCacheKey = getMyPurchasesCacheKey(
        chain.id,
        normalizedUserAddress,
      );
      const fullResponsePayload = {
        success: true,
        items: existingItems,
        count: existingItems.length,
        totalItems,
      };

      try {
        await redis.set(fullCacheKey, fullResponsePayload, {
          ex: CACHE_TTL.ONE_DAY,
        });
        console.log(
          `[My Purchases] Cached full Wish Fund dataset for ${normalizedUserAddress} (TTL: ${CACHE_TTL.ONE_DAY}s)`,
        );
      } catch (error) {
        console.error("[My Purchases] Redis cache write error:", error);
      }

      // If this was a paginated request, slice the data and cache the paginated result
      if (usePagination) {
        const paginatedItems = existingItems.slice(offset, offset + limit);
        const paginatedResponsePayload = {
          success: true,
          items: paginatedItems,
          count: paginatedItems.length,
          totalItems,
          offset,
          limit,
        };

        const paginatedCacheKey = getMyPurchasesCacheKey(
          chain.id,
          normalizedUserAddress,
          offset,
          limit,
        );
        try {
          await redis.set(paginatedCacheKey, paginatedResponsePayload, {
            ex: CACHE_TTL.ONE_DAY,
          });
          console.log(
            `[My Purchases] Cached paginated Wish Fund data for ${normalizedUserAddress} (offset: ${offset}, limit: ${limit})`,
          );
        } catch (error) {
          console.error("[My Purchases] Redis cache write error:", error);
        }

        return NextResponse.json(paginatedResponsePayload);
      }

      // Non-paginated request, return full dataset
      return NextResponse.json(fullResponsePayload);
    }

    // For non-multisig addresses or when not caching, return as before
    const responsePayload = {
      success: true,
      items: existingItems,
      count: existingItems.length,
      totalItems,
      offset,
      limit: usePagination ? limit : undefined,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Error fetching my purchases:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch purchases",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
