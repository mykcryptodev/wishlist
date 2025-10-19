import { NextRequest, NextResponse } from "next/server";
import {
  thirdwebWriteContract,
  thirdwebReadContract,
} from "@/lib/thirdweb-http-api";
import { chain, wishlist } from "@/constants";
import { invalidateWishlistAddressesCache } from "@/lib/cache-utils";

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
    const itemIds = result.result[0].data || result.result[0].result;
    const totalItems = result.result[1].data || result.result[1].result;

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

    // Get details for each item using the public items mapping
    // This returns: (id, owner, title, description, url, imageUrl, price, exists, createdAt, updatedAt)
    const itemDetailsCalls = itemIds.map((itemId: string) => ({
      contractAddress: wishlist[chain.id],
      method:
        "function items(uint256) external view returns (uint256 id, address owner, string title, string description, string url, string imageUrl, uint256 price, bool exists, uint256 createdAt, uint256 updatedAt)",
      params: [itemId],
    }));

    const itemDetailsResult = await thirdwebReadContract(
      itemDetailsCalls,
      chain.id,
    );

    // The thirdweb API returns the public mapping data as an array
    // Array format: [id, owner, title, description, url, imageUrl, price, exists, createdAt, updatedAt]
    const items = itemDetailsResult.result
      .map((item: any) => {
        const data = item.data || item.result;

        // Skip items with errors or no data
        if (!data || !item.success) {
          console.error("Item fetch failed:", item.error?.message);
          return null;
        }

        // Data is an array: [id, owner, title, description, url, imageUrl, price, exists, createdAt, updatedAt]
        return {
          id: data[0],
          owner: data[1],
          title: data[2],
          description: data[3],
          url: data[4],
          imageUrl: data[5],
          price: data[6],
          // Skip data[7] which is the 'exists' boolean
          createdAt: data[8],
          updatedAt: data[9],
        };
      })
      .filter(Boolean); // Remove any null entries

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
