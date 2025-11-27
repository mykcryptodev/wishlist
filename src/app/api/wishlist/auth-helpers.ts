import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth-utils";

export async function getAuthenticatedAddress(
  request: NextRequest,
  action: string,
) {
  try {
    const address = await requireAuth(request);
    return { address };
  } catch (error) {
    return {
      errorResponse: NextResponse.json(
        {
          error: `Authentication required to ${action}`,
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 401 },
      ),
    } as const;
  }
}
