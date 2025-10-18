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
    const result = await thirdwebReadContract(
      [
        {
          contractAddress: wishlist[chain.id],
          method:
            "function getPurchasers(uint256 _itemId) external view returns (Purchaser[] memory)",
          params: [itemId],
        },
        {
          contractAddress: wishlist[chain.id],
          method:
            "function getPurchaserCount(uint256 _itemId) external view returns (uint256)",
          params: [itemId],
        },
      ],
      chain.id,
    );

    // Extract data from thirdweb API response (handles both .data and .result formats)
    const purchasers = result.result[0].data || result.result[0].result;
    const count = result.result[1].data || result.result[1].result;

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
