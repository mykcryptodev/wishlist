import { getProviderData } from "@vercel/flags/next";
import { NextResponse } from "next/server";

import { flags } from "@/flags";

export function GET() {
  const providerData = getProviderData(
    Object.fromEntries(
      flags.map(featureFlag => [featureFlag.key, featureFlag]),
    ),
  );

  return NextResponse.json(providerData);
}
