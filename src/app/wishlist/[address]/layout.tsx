import { Metadata } from "next";

import { appName } from "@/constants";
import {
  generateFarcasterMetadata,
  getBaseUrl,
} from "@/lib/farcaster-metadata";

interface WishlistLayoutProps {
  params: Promise<{ address: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;
  const baseUrl = getBaseUrl();

  // Fetch wishlist data to get name and item count
  let displayName = "";
  let itemCount = 0;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_URL || baseUrl;
    const response = await fetch(
      `${apiUrl}/api/wishlist?userAddress=${address}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      },
    );
    const data = await response.json();

    if (data.success) {
      itemCount = data.items?.length || 0;
      // We don't have name in the API response, so we'll use address
      displayName = address;
    }
  } catch (error) {
    console.error("Error fetching wishlist for metadata:", error);
  }

  const shortenedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const title = `${shortenedAddress}'s Wishlist | ${appName}`;
  const description =
    itemCount > 0
      ? `Check out ${shortenedAddress}'s wishlist with ${itemCount} ${itemCount === 1 ? "item" : "items"}! Browse and mark items you'd like to purchase.`
      : `Check out ${shortenedAddress}'s wishlist on ${appName}`;

  const ogImageUrl = `${baseUrl}/api/wishlist/og?address=${address}&itemCount=${itemCount}`;
  const wishlistUrl = `${baseUrl}/wishlist/${address}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      url: wishlistUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    other: {
      ...generateFarcasterMetadata({
        appName,
        imageUrl: ogImageUrl,
        splashImageUrl: `${baseUrl}/images/logo.png`,
        splashBackgroundColor: "#000000",
        url: wishlistUrl,
      }),
    },
  };
}

export default async function WishlistLayout({
  children,
}: WishlistLayoutProps) {
  return <>{children}</>;
}
