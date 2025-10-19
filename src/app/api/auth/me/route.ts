import { NextRequest, NextResponse } from "next/server";
import { thirdwebAuth } from "@/lib/thirdweb-server";

/**
 * GET /api/auth/me
 *
 * Check if the user is logged in and return their address
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ isLoggedIn: false }, { status: 401 });
    }

    const jwt = authHeader.substring(7);

    // Use Thirdweb's verifyJWT to verify the token
    const verifiedToken = await thirdwebAuth.verifyJWT({ jwt });

    if (!verifiedToken.valid) {
      return NextResponse.json(
        { isLoggedIn: false, error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    console.log("Verified JWT:", {
      sub: verifiedToken.parsedJWT.sub,
      parsedJWT: verifiedToken.parsedJWT,
    });

    // The verified token contains the payload with the address
    // Normalize to lowercase for consistent comparison
    return NextResponse.json({
      isLoggedIn: true,
      address: verifiedToken.parsedJWT.sub.toLowerCase(),
    });
  } catch (error) {
    console.error("Error checking auth status:", error);
    return NextResponse.json(
      {
        error: "Failed to check auth status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
