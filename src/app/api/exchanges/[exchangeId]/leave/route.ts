import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-utils";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * DELETE /api/exchanges/[exchangeId]/leave
 *
 * Leave an exchange
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ exchangeId: string }> },
) {
  try {
    // Authenticate the user
    const walletAddress = await requireAuth(request);
    const { exchangeId } = await params;

    // Remove user from exchange
    const { error: deleteError } = await supabaseAdmin
      .from("exchange_memberships")
      .delete()
      .eq("exchange_id", exchangeId)
      .eq("wallet_address", walletAddress.toLowerCase());

    if (deleteError) {
      console.error("Error leaving exchange:", deleteError);
      return NextResponse.json(
        { error: "Failed to leave exchange" },
        { status: 500 },
      );
    }

    // Check if exchange has any members left
    const { count } = await supabaseAdmin
      .from("exchange_memberships")
      .select("*", { count: "exact", head: true })
      .eq("exchange_id", exchangeId);

    // If no members left, delete the exchange
    if (count === 0) {
      await supabaseAdmin.from("exchanges").delete().eq("id", exchangeId);
    }

    return NextResponse.json({
      success: true,
      message: "Successfully left exchange",
    });
  } catch (error) {
    console.error("Error in DELETE /api/exchanges/[exchangeId]/leave:", error);
    return NextResponse.json(
      {
        error: "Unauthorized",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 401 },
    );
  }
}
