import { Metadata } from "next";

import { appDescription, appName } from "@/constants";
import {
  generateFarcasterMetadata,
  getBaseUrl,
} from "@/lib/farcaster-metadata";

export const metadata: Metadata = {
  title: `My Wishlist | ${appName}`,
  description: appDescription,
  openGraph: {
    title: `My Wishlist | ${appName}`,
    description: appDescription,
    images: [
      {
        url: `${getBaseUrl()}/api/wishlist/og`,
        width: 1200,
        height: 630,
        alt: "Create your wishlist",
      },
    ],
    url: `${getBaseUrl()}/wishlist`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `My Wishlist | ${appName}`,
    description: appDescription,
    images: [`${getBaseUrl()}/api/wishlist/og`],
  },
  other: {
    ...generateFarcasterMetadata({
      appName,
      imageUrl: `${getBaseUrl()}/api/wishlist/og`,
      splashImageUrl: `${getBaseUrl()}/images/logo.png`,
      splashBackgroundColor: "#000000",
      url: `${getBaseUrl()}/wishlist`,
    }),
  },
};

export default function WishlistRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
