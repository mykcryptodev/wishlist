import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/logout
 *
 * Clear the user's session
 */
export async function POST(_request: NextRequest) {
  try {
    // In a more robust implementation, you would invalidate the token in a database
    // For now, we just return success and let the client clear the token
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json(
      {
        error: "Failed to log out",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
