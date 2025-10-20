import { NextRequest, NextResponse } from "next/server";
import { thirdwebAuth } from "@/lib/thirdweb-server";
import { base } from "thirdweb/chains";

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
    // IMPORTANT: Specify chain_id for Base to enable smart account verification
    const payload = await thirdwebAuth.generatePayload({
      address,
      chainId: base.id, // Base mainnet chain ID (8453)
    });

    console.log("Generated payload with chain ID:", payload.chain_id);

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

    // Verify the payload and signature
    // With the correct chain_id (8453 for Base), thirdweb's verifyPayload
    // will automatically use verifySignature with chain support,
    // enabling ERC-1271 (smart contract) and ERC-6492 (undeployed contract) verification
    const verifiedPayload = await thirdwebAuth.verifyPayload({
      payload,
      signature,
    });

    if (!verifiedPayload.valid) {
      console.error("Signature verification failed:", verifiedPayload.error);
      return NextResponse.json(
        { error: "Invalid signature", details: verifiedPayload.error },
        { status: 401 },
      );
    }

    console.log(
      "Signature verified successfully for:",
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
