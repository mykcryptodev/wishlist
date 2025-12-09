import { NextRequest, NextResponse } from "next/server";
import { isAddressEqual } from "viem";

import { chain, wishlist } from "@/constants";
import { requireAuth } from "@/lib/auth-utils";
import { invalidateWishlistAddressesCache } from "@/lib/cache-utils";
import {
  thirdwebReadContract,
  thirdwebWriteContract,
} from "@/lib/thirdweb-http-api";

/**
 * Create wishlist item endpoint
 *
 * POST /api/wishlist
 *
 * Creates a new wishlist item for a user on the blockchain.
 *
 * @body title - The item title (required)
 * @body url - The item URL (required)
 * @body userAddress - The user's wallet address (required)
 * @body description - Optional item description
 * @body imageUrl - Optional image URL
 * @body price - Optional price in ETH (will be converted to wei)
 *
 * @returns Transaction ID for monitoring
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, url, imageUrl, price, userAddress } = body;

    // Validate required fields
    if (!title || !url || !userAddress) {
      return NextResponse.json(
        { error: "Missing required fields: title, url, userAddress" },
        { status: 400 },
      );
    }

    // Convert price to wei if provided, with validation
    let priceInWei = "0";
    if (price) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return NextResponse.json(
          { error: "Invalid price value" },
          { status: 400 },
        );
      }
      priceInWei = BigInt(Math.floor(priceNum * 1e18)).toString();
    }

    // Require authentication and ensure the user is creating items for themselves
    let authenticatedAddress: string;
    try {
      authenticatedAddress = await requireAuth(request);
    } catch (error) {
      return NextResponse.json(
        {
          error: "Authentication required to add wishlist items",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 401 },
      );
    }

    if (
      !isAddressEqual(
        authenticatedAddress as `0x${string}`,
        userAddress as `0x${string}`,
      )
    ) {
      return NextResponse.json(
        { error: "You can only add wishlist items for your own address" },
        { status: 403 },
      );
    }

    // Call the smart contract to create item for user
    const result = await thirdwebWriteContract(
      [
        {
          contractAddress: wishlist[chain.id],
          method:
            "function createItemForUser(address _owner, string memory _title, string memory _description, string memory _url, string memory _imageUrl, uint256 _price) external returns (uint256 itemId)",
          params: [
            userAddress,
            title,
            description || "",
            url,
            imageUrl || "",
            priceInWei,
          ],
        },
      ],
      chain.id,
    );

    // Invalidate the wishlist addresses cache since a new user may have been added
    // This ensures search results reflect the new wishlist immediately
    await invalidateWishlistAddressesCache(chain.id);

    return NextResponse.json({
      success: true,
      transactionId: result.result.transactionIds[0],
    });
  } catch (error) {
    console.error("Error creating wishlist item:", error);
    return NextResponse.json(
      {
        error: "Failed to create wishlist item",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Get wishlist items endpoint
 *
 * GET /api/wishlist?userAddress=<address>&page=<page>&limit=<limit>
 *
 * Fetches all wishlist items for a specific user.
 *
 * @query userAddress - The user's wallet address (required)
 * @query page - Page number for pagination (optional, default: 1)
 * @query limit - Items per page (optional, default: 10)
 *
 * @returns Array of wishlist items with pagination info
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!userAddress) {
      return NextResponse.json(
        { error: "Missing userAddress parameter" },
        { status: 400 },
      );
    }

    // Call the smart contract to get user's items
    const result = await thirdwebReadContract(
      [
        {
          contractAddress: wishlist[chain.id],
          method:
            "function getItemsByOwner(address _owner) external view returns (uint256[] memory)",
          params: [userAddress],
        },
        {
          contractAddress: wishlist[chain.id],
          method: "function getTotalItems() external view returns (uint256)",
          params: [],
        },
      ],
      chain.id,
    );

    // Extract data from thirdweb API response (handles both .data and .result formats)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemIdsRaw: any = result.result[0].data || result.result[0].result;
    const totalItems = result.result[1].data || result.result[1].result;

    // Return early if no items
    if (!itemIdsRaw || itemIdsRaw.length === 0) {
      return NextResponse.json({
        success: true,
        items: [],
        totalItems: totalItems || 0,
        page,
        limit,
      });
    }

    // Convert BigInt itemIds to strings/numbers for API calls
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemIds = itemIdsRaw.map((id: any) => {
      if (typeof id === "bigint") {
        return id.toString();
      }
      return id;
    });

    // Get details for each item using the public items mapping
    // This returns: (id, owner, title, description, url, imageUrl, price, exists, createdAt, updatedAt)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemDetailsCalls = itemIds.map((itemId: any) => ({
      contractAddress: wishlist[chain.id],
      method:
        "function items(uint256) external view returns (uint256 id, address owner, string title, string description, string url, string imageUrl, uint256 price, bool exists, uint256 createdAt, uint256 updatedAt)",
      params: [itemId],
    }));

    const itemDetailsResult = await thirdwebReadContract(
      itemDetailsCalls,
      chain.id,
    );

    // Check if the API returned primitive values instead of tuples
    // This happens when multicall fails and Thirdweb API doesn't decode tuples properly
    const hasPrimitiveReturns = itemDetailsResult.result.some(
      (item: any, index: number) => {
        const data = item.data || item.result;
        // Check if data is a primitive (BigInt, number, or numeric string) instead of array/object
        // Don't check item.success because primitives might still have success: true
        const isPrimitive =
          typeof data === "bigint" ||
          typeof data === "number" ||
          (typeof data === "string" && /^\d+$/.test(data) && data.length < 50); // Numeric string, not a full address or long string

        if (isPrimitive) {
          console.log(
            `[DEBUG] Detected primitive return at index ${index}:`,
            typeof data,
            data,
            "for itemId",
            itemIds[index],
          );
        }
        return isPrimitive;
      },
    );

    // If we got primitive returns, make individual calls to get full item data
    let items: any[];
    if (hasPrimitiveReturns) {
      console.warn(
        `Batch call returned primitives for ${itemIds.length} items, falling back to individual calls`,
      );
      const individualCalls = await Promise.all(
        itemIds.map(async (itemId: string | number, idx: number) => {
          try {
            // Single calls won't use multicall (only used when calls.length > 1)
            const result = await thirdwebReadContract(
              [
                {
                  contractAddress: wishlist[chain.id],
                  method:
                    "function items(uint256) external view returns (uint256 id, address owner, string title, string description, string url, string imageUrl, uint256 price, bool exists, uint256 createdAt, uint256 updatedAt)",
                  params: [String(itemId)], // Ensure it's a string
                },
              ],
              chain.id,
            );
            return result.result[0];
          } catch (error) {
            console.error(
              `Failed to fetch item ${itemId} (index ${idx}):`,
              error,
            );
            return { success: false };
          }
        }),
      );
      items = individualCalls;
    } else {
      items = itemDetailsResult.result;
    }

    // The thirdweb API returns the public mapping data as an array
    // Array format: [id, owner, title, description, url, imageUrl, price, exists, createdAt, updatedAt]
    const processedItems = items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any, index: number) => {
        const data = item.data || item.result;

        // Skip items with errors or no data
        if (!data || !item.success) {
          console.error(
            `Item fetch failed for itemId ${itemIds[index]}:`,
            item.error?.message || "No data returned",
            { item, hasData: !!data, success: item.success },
          );
          return null;
        }

        // Debug: log the data structure for first few items
        if (index < 3) {
          console.log(`[DEBUG] Item ${index}, itemId: ${itemIds[index]}`, {
            dataType: Array.isArray(data) ? "array" : typeof data,
            dataLength: Array.isArray(data) ? data.length : "N/A",
            data0: Array.isArray(data) ? data[0] : data?.id,
            fullData: data,
          });
        }

        // Handle different data formats:
        // 1. Array format: [id, owner, title, description, url, imageUrl, price, exists, createdAt, updatedAt]
        // 2. Object format: { id, owner, title, ... }
        // 3. BigInt/primitive format: When API returns just a value instead of tuple (shouldn't happen but handle it)
        let itemData: any;

        if (Array.isArray(data)) {
          // Check if array has required elements
          if (data.length < 10) {
            console.error(
              `Item data incomplete at index ${index}, itemId: ${itemIds[index]}, length: ${data.length}`,
              data,
            );
            return null;
          }

          // Check if id exists (can be 0, but not null/undefined)
          if (data[0] == null || data[0] === undefined) {
            console.error(
              `Item ID is null/undefined at index ${index}, itemId: ${itemIds[index]}`,
              { data0: data[0], dataLength: data.length },
            );
            return null;
          }

          itemData = {
            id: data[0],
            owner: data[1],
            title: data[2],
            description: data[3],
            url: data[4],
            imageUrl: data[5],
            price: data[6],
            exists: data[7],
            createdAt: data[8],
            updatedAt: data[9],
          };
        } else if (typeof data === "bigint" || typeof data === "number") {
          // When API returns just a primitive value instead of tuple, it means decoding failed
          // This shouldn't happen, but if it does, we can't construct the item
          console.error(
            `Item data is primitive (not tuple) at index ${index}, itemId: ${itemIds[index]}, data: ${data}`,
            "This indicates the API didn't properly decode the tuple return type",
          );
          return null;
        } else if (data && typeof data === "object") {
          // Object format
          itemData = data;
        } else {
          console.error(
            `Unexpected data format at index ${index}, itemId: ${itemIds[index]}`,
            { dataType: typeof data, data },
          );
          return null;
        }

        // Validate required fields - id must exist (can be 0 or 0n, but not null/undefined)
        // BigInt 0n is falsy but valid, so we check explicitly for null/undefined
        const idValue = itemData.id;

        // Check if id is null or undefined (but allow 0 and 0n)
        if (idValue === null || idValue === undefined) {
          console.error(
            `Item missing ID at index ${index}, itemId: ${itemIds[index]}`,
            {
              idValue,
              idType: typeof idValue,
              itemData,
              rawData: data,
            },
          );
          return null;
        }

        // Convert BigInt values to strings for JSON serialization
        return {
          id: String(idValue), // idValue is guaranteed to exist at this point
          owner: itemData.owner || "",
          title: itemData.title || "",
          description: itemData.description || "",
          url: itemData.url || "",
          imageUrl: itemData.imageUrl || "",
          price: itemData.price != null ? String(itemData.price) : "0",
          // Skip exists field
          createdAt:
            itemData.createdAt != null ? String(itemData.createdAt) : "0",
          updatedAt:
            itemData.updatedAt != null ? String(itemData.updatedAt) : "0",
        };
      })
      .filter(
        item =>
          item != null &&
          item.id != null &&
          item.id !== "undefined" &&
          item.id !== "null",
      ); // Remove any null entries and items with invalid IDs

    console.log(
      `[Wishlist API] Returning ${processedItems.length} items for user ${userAddress}`,
    );
    if (processedItems.length > 0 && processedItems[0]) {
      console.log(`[Wishlist API] First item:`, {
        id: processedItems[0].id,
        title: processedItems[0].title,
        owner: processedItems[0].owner,
      });
    }

    return NextResponse.json({
      success: true,
      items: processedItems,
      totalItems,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch wishlist items",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
