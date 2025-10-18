import { NextRequest, NextResponse } from "next/server";
import {
  thirdwebWriteContract,
  thirdwebReadContract,
} from "@/lib/thirdweb-http-api";
import { chain, wishlist } from "@/constants";

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

    const itemIds = result.result[0].result;
    const totalItems = result.result[1].result;

    // Return early if no items
    if (!itemIds || itemIds.length === 0) {
      return NextResponse.json({
        success: true,
        items: [],
        totalItems: totalItems || 0,
        page,
        limit,
      });
    }

    // Get details for each item
    const itemDetailsCalls = itemIds.map((itemId: string) => ({
      contractAddress: wishlist[chain.id],
      method:
        "function getItem(uint256 _itemId) external view returns (WishlistItem memory)",
      params: [itemId],
    }));

    const itemDetailsResult = await thirdwebReadContract(
      itemDetailsCalls,
      chain.id,
    );

    const items = itemDetailsResult.result.map((item: any) => ({
      id: item.result.id,
      owner: item.result.owner,
      title: item.result.title,
      description: item.result.description,
      url: item.result.url,
      imageUrl: item.result.imageUrl,
      price: item.result.price,
      createdAt: item.result.createdAt,
      updatedAt: item.result.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      items,
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
