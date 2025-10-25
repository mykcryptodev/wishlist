import type { Metadata } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";

import { ChristmasSnowfall } from "@/components/christmas-snowfall";
import { Navigation } from "@/components/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { appName } from "@/constants";
import {
  generateFarcasterMetadata,
  getBaseUrl,
} from "@/lib/farcaster-metadata";
import { DisplayTokenProvider } from "@/providers/DisplayTokenProvider";
import { FarcasterProvider } from "@/providers/Farcaster";
import ThirdwebProvider from "@/providers/Thirdweb";

import "./globals.css";

const fredoka = localFont({
  src: [
    {
      path: "../../public/fonts/Fredoka/Fredoka-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Fredoka/Fredoka-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Fredoka/Fredoka-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Fredoka/Fredoka-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Fredoka/Fredoka-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-fredoka",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";
  const baseUrl = getBaseUrl();
  const fullUrl = `${baseUrl}${pathname}`;
  const ogImageUrl = `${baseUrl}/api/og`;

  const title = "Wishlist - Create Your Perfect Holiday Wishlist";
  const description =
    "Create and organize your holiday wishlist by adding items from any website. Share with family and friends to make gift-giving easier.";

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
          height: 800,
          alt: title,
        },
      ],
      type: "website",
      url: fullUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    other: generateFarcasterMetadata({
      appName,
      imageUrl: ogImageUrl,
      splashImageUrl: `${baseUrl}/splash-image.png`,
      splashBackgroundColor: "#000000",
      url: fullUrl,
    }),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={`${fredoka.variable} antialiased`}>
        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
        >
          <ThirdwebProvider>
            <DisplayTokenProvider>
              <FarcasterProvider>
                <ChristmasSnowfall />
                <Navigation />
                {children}
              </FarcasterProvider>
            </DisplayTokenProvider>
          </ThirdwebProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
