import { NextRequest, NextResponse } from "next/server";
import { thirdwebWriteContract } from "@/lib/thirdweb-http-api";
import { chain, wishlist } from "@/constants";

/**
 * Update wishlist item endpoint
 *
 * PUT /api/wishlist/[itemId]
 *
 * Updates an existing wishlist item on the blockchain.
 *
 * @body itemId - The item ID to update (required)
 * @body title - The item title (required)
 * @body url - The item URL (required)
 * @body description - Optional item description
 * @body imageUrl - Optional image URL
 * @body price - Optional price in ETH (will be converted to wei)
 *
 * @returns Transaction ID for monitoring
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, title, description, url, imageUrl, price } = body;

    // Validate required fields
    if (!itemId || !title || !url) {
      return NextResponse.json(
        { error: "Missing required fields: itemId, title, url" },
        { status: 400 },
      );
    }

    // Validate itemId is a number
    const itemIdNum = parseInt(itemId);
    if (isNaN(itemIdNum) || itemIdNum < 0) {
      return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });
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

    // Call the smart contract to update item
    const result = await thirdwebWriteContract(
      [
        {
          contractAddress: wishlist[chain.id],
          method:
            "function updateItemForUser(uint256 _itemId, string memory _title, string memory _description, string memory _url, string memory _imageUrl, uint256 _price) external",
          params: [
            itemId,
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

    return NextResponse.json({
      success: true,
      transactionId: result.result.transactionIds[0],
    });
  } catch (error) {
    console.error("Error updating wishlist item:", error);
    return NextResponse.json(
      {
        error: "Failed to update wishlist item",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Delete wishlist item endpoint
 *
 * DELETE /api/wishlist/[itemId]?itemId=<id>
 *
 * Deletes a wishlist item from the blockchain.
 *
 * @query itemId - The item ID to delete (required)
 *
 * @returns Transaction ID for monitoring
 */
export async function DELETE(request: NextRequest) {
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

    // Call the smart contract to delete item
    const result = await thirdwebWriteContract(
      [
        {
          contractAddress: wishlist[chain.id],
          method: "function deleteItemForUser(uint256 _itemId) external",
          params: [itemId],
        },
      ],
      chain.id,
    );

    return NextResponse.json({
      success: true,
      transactionId: result.result.transactionIds[0],
    });
  } catch (error) {
    console.error("Error deleting wishlist item:", error);
    return NextResponse.json(
      {
        error: "Failed to delete wishlist item",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
