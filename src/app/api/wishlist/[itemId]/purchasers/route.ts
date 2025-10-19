import { NextRequest, NextResponse } from "next/server";
import {
  thirdwebWriteContract,
  thirdwebReadContract,
} from "@/lib/thirdweb-http-api";
import { chain, wishlist } from "@/constants";
import { optionalAuth } from "@/lib/auth-utils";
import { getApprovedPurchasers } from "@/lib/exchange-utils";

/**
 * Sign up purchaser endpoint
 *
 * POST /api/wishlist/[itemId]/purchasers
 *
 * Adds a purchaser to a wishlist item.
 *
 * @body itemId - The item ID (required)
 * @body purchaserAddress - The purchaser's wallet address (required)
 *
 * @returns Transaction ID for monitoring
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, purchaserAddress } = body;

    // Validate required fields
    if (!itemId || !purchaserAddress) {
      return NextResponse.json(
        { error: "Missing required fields: itemId, purchaserAddress" },
        { status: 400 },
      );
    }

    // Validate itemId is a number
    const itemIdNum = parseInt(itemId);
    if (isNaN(itemIdNum) || itemIdNum < 0) {
      return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });
    }

    // Call the smart contract to sign up purchaser
    const result = await thirdwebWriteContract(
      [
        {
          contractAddress: wishlist[chain.id],
          method:
            "function signUpPurchaserForUser(uint256 _itemId, address _purchaser) external",
          params: [itemId, purchaserAddress],
        },
      ],
      chain.id,
    );

    return NextResponse.json({
      success: true,
      transactionId: result.result.transactionIds[0],
    });
  } catch (error) {
    console.error("Error signing up purchaser:", error);
    return NextResponse.json(
      {
        error: "Failed to sign up purchaser",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Remove purchaser endpoint
 *
 * DELETE /api/wishlist/[itemId]/purchasers?itemId=<id>&purchaserAddress=<address>
 *
 * Removes a purchaser from a wishlist item.
 *
 * @query itemId - The item ID (required)
 * @query purchaserAddress - The purchaser's wallet address (required)
 *
 * @returns Transaction ID for monitoring
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const purchaserAddress = searchParams.get("purchaserAddress");

    if (!itemId || !purchaserAddress) {
      return NextResponse.json(
        { error: "Missing required parameters: itemId, purchaserAddress" },
        { status: 400 },
      );
    }

    // Validate itemId is a number
    const itemIdNum = parseInt(itemId);
    if (isNaN(itemIdNum) || itemIdNum < 0) {
      return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });
    }
    // Call the smart contract to remove purchaser
    const result = await thirdwebWriteContract(
      [
        {
          contractAddress: wishlist[chain.id],
          method:
            "function removePurchaserForUser(uint256 _itemId, address _purchaser) external",
          params: [itemId, purchaserAddress],
        },
      ],
      chain.id,
    );

    return NextResponse.json({
      success: true,
      transactionId: result.result.transactionIds[0],
    });
  } catch (error) {
    console.error("Error removing purchaser:", error);
    return NextResponse.json(
      {
        error: "Failed to remove purchaser",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Get purchasers endpoint
 *
 * GET /api/wishlist/[itemId]/purchasers?itemId=<id>
 *
 * Retrieves all purchasers for a specific wishlist item.
 * - If requester is the item owner, returns empty array (owners can't see purchasers)
 * - If requester is authenticated and in an exchange, only shows approved purchasers
 * - If requester is not authenticated, returns all purchasers
 *
 * @query itemId - The item ID (required)
 *
 * @returns Array of purchasers and total count
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "Missing itemId parameter" },
        { status: 400 },
      );
    }

    // Validate itemId is a number
    const itemIdNum = parseInt(itemId);
    if (isNaN(itemIdNum) || itemIdNum < 0) {
      return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });
    }

    // Get the authenticated user's wallet address (if any)
    const authenticatedAddress = await optionalAuth(request);

    // Get the item owner
    const itemResult = await thirdwebReadContract(
      [
        {
          contractAddress: wishlist[chain.id],
          method:
            "function getItem(uint256) view returns (uint256 id, address owner, string title, string description, string url, string imageUrl, uint256 price, bool exists, uint256 createdAt, uint256 updatedAt)",
          params: [itemId],
        },
      ],
      chain.id,
    );

    const itemData = itemResult.result[0].data || itemResult.result[0].result;
    const itemOwner = Array.isArray(itemData)
      ? itemData[1]?.toLowerCase()
      : itemData?.owner?.toLowerCase();

    // If requester is the item owner, return empty array
    if (
      authenticatedAddress &&
      itemOwner === authenticatedAddress.toLowerCase()
    ) {
      return NextResponse.json({
        success: true,
        purchasers: [],
        count: 0,
        isOwner: true,
        message: "Item owners cannot view purchaser information",
      });
    }

    // Get purchasers for the item
    // Note: Inline the Purchaser struct as a tuple since Thirdweb doesn't know custom types
    // The struct has: address purchaser, uint256 signedUpAt, bool exists
    // Tuple syntax: (type1,type2,type3)[] without field names
    const result = await thirdwebReadContract(
      [
        {
          contractAddress: wishlist[chain.id],
          method:
            "function getPurchasers(uint256) view returns ((address,uint256,bool)[])",
          params: [itemId],
        },
        {
          contractAddress: wishlist[chain.id],
          method: "function getPurchaserCount(uint256) view returns (uint256)",
          params: [itemId],
        },
      ],
      chain.id,
    );

    // Extract data from thirdweb API response (handles both .data and .result formats)
    const purchasersRaw = result.result[0].data || result.result[0].result;
    const countRaw = result.result[1].data || result.result[1].result;

    console.log("[GET Purchasers] Raw response:", {
      purchasersRaw,
      countRaw,
      itemId,
      authenticatedAddress,
    });

    // Ensure purchasers is an array and convert BigInt to strings for JSON serialization
    let purchasers = Array.isArray(purchasersRaw)
      ? purchasersRaw
          .filter((p: any) => p != null) // Filter out null entries
          .map((p: any) => {
            // Handle tuple format: [address, uint256, bool]
            if (Array.isArray(p)) {
              return {
                purchaser: p[0],
                signedUpAt:
                  typeof p[1] === "bigint"
                    ? p[1].toString()
                    : p[1]?.toString() || "0",
                exists: p[2] ?? true,
              };
            }
            // Handle object format: {0: address, 1: uint256, 2: bool} or {purchaser, signedUpAt, exists}
            return {
              purchaser: p.purchaser || p[0],
              signedUpAt:
                typeof p.signedUpAt === "bigint"
                  ? p.signedUpAt.toString()
                  : typeof p[1] === "bigint"
                    ? p[1].toString()
                    : (p.signedUpAt || p[1] || "0").toString(),
              exists: p.exists ?? p[2] ?? true,
            };
          })
      : [];

    // If user is authenticated and in an exchange, filter to only show approved purchasers
    if (authenticatedAddress) {
      const approvedPurchasers =
        await getApprovedPurchasers(authenticatedAddress);

      if (approvedPurchasers.size > 0) {
        // Filter purchasers to only include approved ones
        purchasers = purchasers.filter((p: any) =>
          approvedPurchasers.has(p.purchaser.toLowerCase()),
        );

        console.log("[GET Purchasers] Filtered to approved purchasers:", {
          originalCount: Array.isArray(purchasersRaw)
            ? purchasersRaw.length
            : 0,
          filteredCount: purchasers.length,
          approvedCount: approvedPurchasers.size,
        });
      }
    }

    const count = purchasers.length;

    console.log("[GET Purchasers] Processed:", {
      purchasersCount: purchasers.length,
      count,
    });

    return NextResponse.json({
      success: true,
      purchasers,
      count,
      isOwner: false,
    });
  } catch (error) {
    console.error("Error fetching purchasers:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch purchasers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
