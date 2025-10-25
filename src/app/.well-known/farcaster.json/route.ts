import { appDescription, appName } from "@/constants";

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL as string;
  return Response.json({
    accountAssociation: {
      header:
        "eyJmaWQiOjIxNzI0OCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGViYTc4NzE3YjZmMDU5Q0ZFMGI3NUU3NUMyZWQ0QkI3Y0E2NTE1NEYifQ",
      payload: "eyJkb21haW4iOiJ3aXNobGlzdC5ob2xpZGF5In0",
      signature:
        "RcZ5KSBGQV5o+BzUjqRwM2+MhvsIwKqWvuKyU1unQUAvAdC1u+8S+vEMKkR3+jfLcJiwJigyTgU+iAn5BkG9qRw=",
    },
    baseBuilder: {
      allowedAddresses: ["0x515B4Ff55078066BA8B025a1e974215084FE86d5"],
    },
    miniapp: {
      version: "1",
      name: appName,
      homeUrl: URL,
      iconUrl: `${URL}/images/logo.png`,
      splashImageUrl: `${URL}/images/logo.png`,
      splashBackgroundColor: "#000000",
      webhookUrl: `${URL}/api/webhook`,
      subtitle: "Gift coordination made easy",
      description: appDescription,
      screenshotUrls: [],
      primaryCategory: "shopping",
      tags: ["holidays", "gift", "christmas", "exchange", "secret santa"],
      heroImageUrl: `${URL}/images/hero.png`,
      tagline: "Gift coordination made easy",
      ogTitle: appName,
      ogDescription: appDescription,
      ogImageUrl: `${URL}/images/hero.png`,
      noindex: false,
    },
  });
}
