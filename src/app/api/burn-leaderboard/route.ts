import { NextResponse } from "next/server";

import { fetchBurnLeaderboard } from "@/lib/ponder";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const leaderboard = await fetchBurnLeaderboard(limit);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("[Burn Leaderboard API] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch leaderboard",
      },
      { status: 500 },
    );
  }
}
