import { appDescription, appName } from "@/constants";

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL as string;
  return Response.json({
    accountAssociation: {
      header:
        "eyJmaWQiOjIxNzI0OCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGViYTc4NzE3YjZmMDU5Q0ZFMGI3NUU3NUMyZWQ0QkI3Y0E2NTE1NEYifQ",
      payload: "eyJkb21haW4iOiJmb290YmFsbC1vbmNoYWluLnZlcmNlbC5hcHAifQ",
      signature:
        "MHhmZDFlMzlmZTM2Yjc5YjVlMTRiNzAzMjNkOGU5YTEwN2IwMmQ3NjQ5ODU4MzI2OTEyM2FmYTY3ODk5MjkwZmY4MjY4MTBkNTViOTNlZGEzYTA2YWZhYmJjMDQ3NzVmNTA3ZDg0Mjg5N2U2Y2M2YzcyZTQxZmM3ODk5NTdiZTc3NTFi",
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
