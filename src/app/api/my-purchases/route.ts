import { NextRequest, NextResponse } from "next/server";

import { chain, multisig, wishlist } from "@/constants";
import { thirdwebReadContract } from "@/lib/thirdweb-http-api";
import {
  CACHE_TTL,
  getMyPurchasesCacheKey,
  redis,
  shouldUseCache,
} from "@/lib/redis";

export const dynamic = "force-dynamic";

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

    if (!userAddress) {
      return NextResponse.json(
        { error: "Missing userAddress parameter" },
        { status: 400 },
      );
    }

    const normalizedUserAddress = userAddress.toLowerCase();
    const wishFundAddress = multisig[chain.id]?.toLowerCase();
    const shouldCacheWishFund =
      normalizedUserAddress === wishFundAddress && shouldUseCache(chain.id);
    const cacheKey =
      shouldCacheWishFund && redis
        ? getMyPurchasesCacheKey(chain.id, normalizedUserAddress)
        : null;

    if (cacheKey && redis) {
      try {
        const cachedResponse = await redis.get(cacheKey);
        if (cachedResponse) {
          console.log(
            `[My Purchases] Returning cached Wish Fund data for ${normalizedUserAddress}`,
          );
          return NextResponse.json(cachedResponse);
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

    console.log(
      `[My Purchases] Total items: ${totalItems}, checking for user: ${userAddress}`,
    );

    // Check each item to see if user is a purchaser
    // Note: This could be optimized with batch calls
    const itemChecks = [];
    for (let itemId = 1; itemId <= totalItems; itemId++) {
      itemChecks.push(
        thirdwebReadContract(
          [
            {
              contractAddress: wishlist[chain.id],
              method:
                "function checkIsPurchaser(uint256,address) view returns (bool)",
              params: [itemId.toString(), userAddress],
            },
          ],
          chain.id,
        ).then(result => ({
          itemId,
          isPurchaser: result.result[0].data || result.result[0].result,
        })),
      );
    }

    const checkResults = await Promise.all(itemChecks);
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
      } as const;

      if (cacheKey && redis) {
        try {
          await redis.set(cacheKey, emptyResponse, { ex: CACHE_TTL.ONE_DAY });
        } catch (error) {
          console.error("[My Purchases] Redis cache write error:", error);
        }
      }

      return NextResponse.json(emptyResponse);
    }

    // Fetch full details for items user is purchasing
    const itemDetailsPromises = purchasingItemIds.map(itemId =>
      thirdwebReadContract(
        [
          {
            contractAddress: wishlist[chain.id],
            method:
              "function getItem(uint256) view returns ((uint256,address,string,string,string,string,uint256,bool,uint256,uint256))",
            params: [itemId.toString()],
          },
        ],
        chain.id,
      ).then(result => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const itemData: any = result.result[0].data || result.result[0].result;

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
      }),
    );

    const items = await Promise.all(itemDetailsPromises);

    // Filter out any items that don't exist
    const existingItems = items.filter(item => item.exists);

    console.log(`[My Purchases] Returning ${existingItems.length} items`);

    const responsePayload = {
      success: true,
      items: existingItems,
      count: existingItems.length,
    };

    if (cacheKey && redis) {
      try {
        await redis.set(cacheKey, responsePayload, { ex: CACHE_TTL.ONE_DAY });
        console.log(
          `[My Purchases] Cached Wish Fund data for ${normalizedUserAddress} (TTL: ${CACHE_TTL.ONE_DAY}s)`,
        );
      } catch (error) {
        console.error("[My Purchases] Redis cache write error:", error);
      }
    }

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
