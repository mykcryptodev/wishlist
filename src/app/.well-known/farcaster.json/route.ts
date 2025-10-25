import { appDescription, appName } from "@/constants";

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL as string;
  return Response.json({
    accountAssociation: {
      header: "",
      payload: "",
      signature: "",
    },
    baseBuilder: {
      allowedAddresses: ["0x515B4Ff55078066BA8B025a1e974215084FE86d5"],
    },
    miniapp: {
      version: "1",
      name: appName,
      homeUrl: URL,
      iconUrl: `${URL}/images/logo-no-bg.png`,
      splashImageUrl: `${URL}/images/logo-no-bg.png`,
      splashBackgroundColor: "#000000",
      webhookUrl: `${URL}/api/webhook`,
      subtitle: "Gift coordination made easy",
      description: appDescription,
      screenshotUrls: [],
      primaryCategory: "shopping",
      tags: ["holidays", "gifts", "wishlist"],
      heroImageUrl: "https://ex.co/og.png",
      tagline: "Gift coordination made easy",
      ogTitle: appName,
      ogDescription: appDescription,
      ogImageUrl: `${URL}/images/hero.png`,
      noindex: true,
    },
  });
}
