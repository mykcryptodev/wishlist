import { NextRequest, NextResponse } from "next/server";
import {
  thirdwebWriteContract,
  thirdwebReadContract,
} from "@/lib/thirdweb-http-api";
import { chain, wishlist } from "@/constants";

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
    });

    // Ensure purchasers is an array and convert BigInt to strings for JSON serialization
    const purchasers = Array.isArray(purchasersRaw)
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

    const count =
      typeof countRaw === "bigint"
        ? Number(countRaw)
        : typeof countRaw === "string"
          ? parseInt(countRaw, 10)
          : countRaw || 0;

    console.log("[GET Purchasers] Processed:", {
      purchasersCount: purchasers.length,
      count,
    });

    return NextResponse.json({
      success: true,
      purchasers,
      count,
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
