import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/exchanges/[exchangeId]/join
 *
 * Join an exchange using an invite code
 *
 * Body:
 * - inviteCode: string (required) - The invite code for the exchange
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ exchangeId: string }> },
) {
  try {
    // Authenticate the user
    const walletAddress = await requireAuth(request);

    // Parse request body
    const body = await request.json();
    const { inviteCode } = body;

    if (!inviteCode || typeof inviteCode !== "string") {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 },
      );
    }

    // Find the exchange by invite code
    const { data: exchange, error: exchangeError } = await supabaseAdmin
      .from("exchanges")
      .select("*")
      .eq("invite_code", inviteCode.toUpperCase())
      .single();

    if (exchangeError || !exchange) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 },
      );
    }

    // Check if user is already a member
    const { data: existingMembership } = await supabaseAdmin
      .from("exchange_memberships")
      .select("id")
      .eq("exchange_id", exchange.id)
      .eq("wallet_address", walletAddress.toLowerCase())
      .single();

    if (existingMembership) {
      return NextResponse.json(
        { error: "You are already a member of this exchange" },
        { status: 400 },
      );
    }

    // Add user to the exchange
    const { error: membershipError } = await supabaseAdmin
      .from("exchange_memberships")
      .insert({
        exchange_id: exchange.id,
        wallet_address: walletAddress.toLowerCase(),
      });

    if (membershipError) {
      console.error("Error adding member:", membershipError);
      return NextResponse.json(
        { error: "Failed to join exchange" },
        { status: 500 },
      );
    }

    // Get updated member count
    const { count } = await supabaseAdmin
      .from("exchange_memberships")
      .select("*", { count: "exact", head: true })
      .eq("exchange_id", exchange.id);

    return NextResponse.json({
      success: true,
      exchange: {
        ...exchange,
        memberCount: count || 0,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/exchanges/[exchangeId]/join:", error);
    return NextResponse.json(
      {
        error: "Unauthorized",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 401 },
    );
  }
}
