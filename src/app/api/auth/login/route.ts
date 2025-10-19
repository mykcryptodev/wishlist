import { NextRequest, NextResponse } from "next/server";
import { thirdwebAuth } from "@/lib/thirdweb-server";

/**
 * GET /api/auth/login
 *
 * Generate a login payload for the user to sign
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 },
      );
    }

    // Use Thirdweb's generatePayload to create a SIWE-compliant payload
    const payload = await thirdwebAuth.generatePayload({
      address,
    });

    return NextResponse.json({ payload });
  } catch (error) {
    console.error("Error generating login payload:", error);
    return NextResponse.json(
      {
        error: "Failed to generate login payload",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/auth/login
 *
 * Verify the signed message and create a session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payload, signature } = body;

    console.log("Login request received:", {
      payload,
      signature: signature ? `${signature.slice(0, 10)}...` : "none",
    });

    if (!payload || !signature) {
      return NextResponse.json(
        { error: "Payload and signature are required" },
        { status: 400 },
      );
    }

    // Use Thirdweb's verifyPayload to verify the signature
    const verifiedPayload = await thirdwebAuth.verifyPayload({
      payload,
      signature,
    });

    if (!verifiedPayload.valid) {
      console.error("Signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log(
      "Signature verified successfully:",
      verifiedPayload.payload.address,
    );
    console.log("Verified payload:", verifiedPayload.payload);

    // Generate a JWT using Thirdweb's generateJWT
    const jwt = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
    });

    console.log("Generated JWT (first 50 chars):", jwt.substring(0, 50));

    return NextResponse.json({
      success: true,
      token: jwt,
      address: verifiedPayload.payload.address.toLowerCase(),
    });
  } catch (error) {
    console.error("Error verifying login:", error);
    return NextResponse.json(
      {
        error: "Failed to verify login",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
