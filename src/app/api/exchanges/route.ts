import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { supabaseAdmin } from "@/lib/supabase";
import { generateUniqueInviteCode } from "@/lib/exchange-utils";

/**
 * GET /api/exchanges
 *
 * List all exchanges that the authenticated user is a member of
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const walletAddress = await requireAuth(request);

    // Get all exchange IDs the user is a member of
    const { data: memberships, error: membershipError } = await supabaseAdmin
      .from("exchange_memberships")
      .select("exchange_id")
      .eq("wallet_address", walletAddress.toLowerCase());

    if (membershipError) {
      console.error("Error fetching memberships:", membershipError);
      return NextResponse.json(
        { error: "Failed to fetch exchanges" },
        { status: 500 },
      );
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({
        success: true,
        exchanges: [],
      });
    }

    const exchangeIds = memberships.map(m => m.exchange_id);

    // Get exchange details
    const { data: exchanges, error: exchangesError } = await supabaseAdmin
      .from("exchanges")
      .select("*")
      .in("id", exchangeIds)
      .order("created_at", { ascending: false });

    if (exchangesError) {
      console.error("Error fetching exchanges:", exchangesError);
      return NextResponse.json(
        { error: "Failed to fetch exchanges" },
        { status: 500 },
      );
    }

    // For each exchange, get member count
    const exchangesWithCounts = await Promise.all(
      (exchanges || []).map(async exchange => {
        const { count } = await supabaseAdmin
          .from("exchange_memberships")
          .select("*", { count: "exact", head: true })
          .eq("exchange_id", exchange.id);

        return {
          ...exchange,
          memberCount: count || 0,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      exchanges: exchangesWithCounts,
    });
  } catch (error) {
    console.error("Error in GET /api/exchanges:", error);
    return NextResponse.json(
      {
        error: "Unauthorized",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 401 },
    );
  }
}

/**
 * POST /api/exchanges
 *
 * Create a new gift exchange
 *
 * Body:
 * - name: string (required) - Name of the exchange (e.g., "Smith Family")
 * - description: string (optional) - Description of the exchange
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const walletAddress = await requireAuth(request);

    // Parse request body
    const body = await request.json();
    const { name, description } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Exchange name is required" },
        { status: 400 },
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Exchange name must be less than 100 characters" },
        { status: 400 },
      );
    }

    // Generate unique invite code
    const inviteCode = await generateUniqueInviteCode();

    // Create the exchange
    const { data: exchange, error: exchangeError } = await supabaseAdmin
      .from("exchanges")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        created_by: walletAddress.toLowerCase(),
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (exchangeError || !exchange) {
      console.error("Error creating exchange:", exchangeError);
      return NextResponse.json(
        { error: "Failed to create exchange" },
        { status: 500 },
      );
    }

    // Automatically add the creator as a member
    const { error: membershipError } = await supabaseAdmin
      .from("exchange_memberships")
      .insert({
        exchange_id: exchange.id,
        wallet_address: walletAddress.toLowerCase(),
      });

    if (membershipError) {
      console.error("Error adding creator as member:", membershipError);
      // Don't fail the request, but log it
    }

    return NextResponse.json({
      success: true,
      exchange: {
        ...exchange,
        memberCount: 1,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/exchanges:", error);
    return NextResponse.json(
      {
        error: "Unauthorized",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 401 },
    );
  }
}
