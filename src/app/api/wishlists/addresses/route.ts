import { NextResponse } from "next/server";
import { chain } from "@/constants";
import { getWishlistAddresses } from "@/lib/wishlist-utils";

/**
 * GET /api/wishlists/addresses
 * Returns all wishlist addresses from the contract
 * Social profile data is fetched client-side using Thirdweb SDK
 */
export async function GET() {
  try {
    const addresses = await getWishlistAddresses(chain.id);

    console.log(`[Wishlists] Returning ${addresses.length} wishlist addresses`);

    return NextResponse.json({
      addresses,
      count: addresses.length,
    });
  } catch (error) {
    console.error("Error fetching wishlist addresses:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch wishlist addresses",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
