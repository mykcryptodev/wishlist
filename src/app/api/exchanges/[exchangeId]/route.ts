import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-utils";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ exchangeId: string }> },
) {
  try {
    const walletAddress = await requireAuth(request);
    const { exchangeId } = await params;

    if (!exchangeId) {
      return NextResponse.json(
        { error: "Exchange ID is required" },
        { status: 400 },
      );
    }

    const normalizedAddress = walletAddress.toLowerCase();

    const { data: membership, error: membershipError } = await supabaseAdmin
      .from("exchange_memberships")
      .select("id")
      .eq("exchange_id", exchangeId)
      .eq("wallet_address", normalizedAddress)
      .maybeSingle();

    if (membershipError) {
      console.error("Error checking exchange membership:", membershipError);
      return NextResponse.json(
        { error: "Failed to verify exchange membership" },
        { status: 500 },
      );
    }

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this exchange" },
        { status: 403 },
      );
    }

    const { data: exchange, error: exchangeError } = await supabaseAdmin
      .from("exchanges")
      .select("*")
      .eq("id", exchangeId)
      .maybeSingle();

    if (exchangeError) {
      console.error("Error fetching exchange:", exchangeError);
      return NextResponse.json(
        { error: "Failed to fetch exchange" },
        { status: 500 },
      );
    }

    if (!exchange) {
      return NextResponse.json(
        { error: "Exchange not found" },
        { status: 404 },
      );
    }

    const { data: members, error: membersError } = await supabaseAdmin
      .from("exchange_memberships")
      .select("wallet_address, joined_at")
      .eq("exchange_id", exchangeId)
      .order("joined_at", { ascending: true });

    if (membersError) {
      console.error("Error fetching exchange members:", membersError);
      return NextResponse.json(
        { error: "Failed to fetch exchange members" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      exchange: {
        ...exchange,
        memberCount: members?.length ?? 0,
      },
      members: members ?? [],
    });
  } catch (error) {
    console.error("Error in GET /api/exchanges/[exchangeId]:", error);
    return NextResponse.json(
      {
        error: "Unauthorized",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 401 },
    );
  }
}
