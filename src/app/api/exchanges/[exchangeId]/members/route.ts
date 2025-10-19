import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/exchanges/[exchangeId]/members
 *
 * Get all members of an exchange
 * Only accessible to members of the exchange
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ exchangeId: string }> },
) {
  try {
    // Authenticate the user
    const walletAddress = await requireAuth(request);
    const { exchangeId } = await params;

    // Check if user is a member of this exchange
    const { data: membership } = await supabaseAdmin
      .from("exchange_memberships")
      .select("id")
      .eq("exchange_id", exchangeId)
      .eq("wallet_address", walletAddress.toLowerCase())
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this exchange" },
        { status: 403 },
      );
    }

    // Get all members
    const { data: members, error: membersError } = await supabaseAdmin
      .from("exchange_memberships")
      .select("wallet_address, joined_at")
      .eq("exchange_id", exchangeId)
      .order("joined_at", { ascending: true });

    if (membersError) {
      console.error("Error fetching members:", membersError);
      return NextResponse.json(
        { error: "Failed to fetch members" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      members: members || [],
    });
  } catch (error) {
    console.error("Error in GET /api/exchanges/[exchangeId]/members:", error);
    return NextResponse.json(
      {
        error: "Unauthorized",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 401 },
    );
  }
}
