import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getSocialProfiles } from "thirdweb/social";

import { serverClient } from "@/lib/thirdweb-server";

export const runtime = "edge";

// Cache the OG image for 1 hour
export const revalidate = 3600;

interface WishlistItem {
  id: string;
  imageUrl: string;
  title: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const itemCount = searchParams.get("itemCount") || "0";

    // Determine if this is a generic "create your wishlist" page or a specific user's wishlist
    const isGeneric = !address;

    // Christmas theme colors - Light mode with cream background
    const forestGreen = "#468763"; // oklch(0.55 0.16 155)
    const gold = "#c0a053"; // oklch(0.68 0.14 85)
    const pineGreen = "#3d7357"; // oklch(0.50 0.14 165)
    const creamBackground = "#faf9f7"; // oklch(0.98 0.008 70) - Light mode cream
    const cardBg = "#ffffff"; // oklch(0.995 0.005 70) - Light mode card
    const textDark = "#2e2721"; // oklch(0.2 0.03 25) - Dark text for light bg

    // Load custom fonts and monster image
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const [fontRegular, fontBold, monsterImage] = await Promise.all([
      fetch(`${baseUrl}/fonts/Fredoka/Fredoka-Medium.ttf`).then(res =>
        res.arrayBuffer(),
      ),
      fetch(`${baseUrl}/fonts/Fredoka/Fredoka-Bold.ttf`).then(res =>
        res.arrayBuffer(),
      ),
      fetch(`${baseUrl}/images/monster-reading.png`).then(res =>
        res.arrayBuffer(),
      ),
    ]);

    // Convert monster image to base64
    const monsterBase64 = Buffer.from(monsterImage).toString("base64");
    const monsterDataUrl = `data:image/png;base64,${monsterBase64}`;

    if (isGeneric) {
      // Generic OG image for the main wishlist page
      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: creamBackground,
              backgroundImage: `radial-gradient(circle at 20% 50%, ${forestGreen}15 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${gold}15 0%, transparent 50%), radial-gradient(circle at 40% 20%, ${pineGreen}15 0%, transparent 50%)`,
              padding: "40px 80px",
              position: "relative",
              fontFamily: "Fredoka, sans-serif",
            }}
          >
            {/* Christmas decorative emojis */}
            <div
              style={{
                position: "absolute",
                top: 60,
                left: 100,
                fontSize: 50,
                opacity: 0.5,
              }}
            >
              🎄
            </div>
            <div
              style={{
                position: "absolute",
                top: 150,
                right: 120,
                fontSize: 40,
                opacity: 0.4,
              }}
            >
              🎅
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 100,
                left: 150,
                fontSize: 45,
                opacity: 0.4,
              }}
            >
              ⛄
            </div>

            {/* Monster image */}
            <img
              alt="Monster"
              height={120}
              src={monsterDataUrl}
              width={120}
              style={{
                position: "absolute",
                bottom: 80,
                right: 100,
                transform: "rotate(-5deg) scaleX(-1)",
                opacity: 0.9,
              }}
            />

            {/* Main content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 60 }}>🎄</span>
                <div
                  style={{
                    display: "flex",
                    fontSize: 70,
                    fontWeight: 700,
                    color: textDark,
                    textAlign: "center",
                  }}
                >
                  Holiday Wishlist
                </div>
                <span style={{ fontSize: 60 }}>🎁</span>
              </div>

              <div
                style={{
                  display: "flex",
                  fontSize: 48,
                  fontWeight: 500,
                  color: gold,
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                ✨ Make gifting magical this holiday season ✨
              </div>

              <div
                style={{
                  display: "flex",
                  fontSize: 32,
                  color: "#6b6560",
                  textAlign: "center",
                  marginTop: 20,
                  maxWidth: 800,
                }}
              >
                Create and share your wishlist • Coordinate with loved ones
              </div>
            </div>

            {/* Bottom app name */}
            <div
              style={{
                display: "flex",
                position: "absolute",
                bottom: 50,
                fontSize: 28,
                color: forestGreen,
                fontWeight: 700,
              }}
            >
              wishlist.myk.party
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          fonts: [
            {
              name: "Fredoka",
              data: fontRegular,
              style: "normal",
              weight: 500,
            },
            {
              name: "Fredoka",
              data: fontBold,
              style: "normal",
              weight: 700,
            },
          ],
        },
      );
    }

    // Fetch social profiles from thirdweb
    let displayName = address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : "Anonymous";
    let socialAvatar: string | undefined;

    if (address) {
      try {
        const profiles = await getSocialProfiles({
          address,
          client: serverClient,
        });

        // Prefer name from any social profile (Farcaster, Lens, or ENS)
        if (profiles && profiles.length > 0) {
          // Prioritize Farcaster, then ENS, then Lens
          const farcasterProfile = profiles.find(p => p.type === "farcaster");
          const ensProfile = profiles.find(p => p.type === "ens");
          const lensProfile = profiles.find(p => p.type === "lens");

          const preferredProfile =
            farcasterProfile || ensProfile || lensProfile || profiles[0];

          if (preferredProfile?.name) {
            displayName = preferredProfile.name;
          }
          if (preferredProfile?.avatar) {
            socialAvatar = preferredProfile.avatar;
          }
        }
      } catch (error) {
        console.error("Error fetching social profiles:", error);
        // Continue with address fallback
      }
    }

    // Fetch wishlist items to get product images
    let productImages: string[] = [];
    if (address) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_URL || baseUrl;
        const wishlistResponse = await fetch(
          `${apiUrl}/api/wishlist?userAddress=${address}`,
          {
            next: { revalidate: 300 },
          },
        );
        const wishlistData = await wishlistResponse.json();

        if (wishlistData.success && wishlistData.items) {
          // Get up to 4 product images
          productImages = wishlistData.items
            .slice(0, 4)
            .map((item: WishlistItem) => item.imageUrl)
            .filter((url: string) => url && url.trim() !== "");
        }
      } catch (error) {
        console.error("Error fetching wishlist items:", error);
        // Continue without product images
      }
    }

    // User-specific wishlist OG image
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: creamBackground,
            backgroundImage: `radial-gradient(circle at 20% 50%, ${forestGreen}12 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${gold}12 0%, transparent 50%)`,
            padding: "50px 70px",
            position: "relative",
            fontFamily: "Fredoka, sans-serif",
          }}
        >
          {/* Christmas decorative emojis */}
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 60,
              fontSize: 45,
              opacity: 0.5,
            }}
          >
            🎄
          </div>
          <div
            style={{
              position: "absolute",
              top: 40,
              right: 80,
              fontSize: 40,
              opacity: 0.4,
            }}
          >
            🎅
          </div>

          {/* Monster image */}
          <img
            alt="Monster"
            height={120}
            src={monsterDataUrl}
            width={120}
            style={{
              position: "absolute",
              bottom: 50,
              right: 60,
              transform: "rotate(-5deg) scaleX(-1)",
              opacity: 0.85,
            }}
          />

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              flex: 1,
              paddingTop: 10,
              paddingBottom: 5,
            }}
          >
            {/* Top section with avatar, name, and items */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              {/* Header with avatar and name */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {socialAvatar && (
                  <img
                    alt="Avatar"
                    height={90}
                    src={socialAvatar}
                    width={90}
                    style={{
                      borderRadius: "50%",
                      border: `4px solid ${forestGreen}`,
                      boxShadow: `0 4px 16px ${forestGreen}44`,
                    }}
                  />
                )}

                {/* Owner name */}
                <div
                  style={{
                    display: "flex",
                    fontSize: 56,
                    fontWeight: 700,
                    color: textDark,
                    textAlign: "center",
                    letterSpacing: "-1.5px",
                  }}
                >
                  {displayName}&apos;s wishlist
                </div>

                {/* Item count badge */}
                {itemCount && Number(itemCount) > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      backgroundColor: forestGreen,
                      borderRadius: 50,
                      padding: "14px 36px",
                      boxShadow: `0 4px 20px ${forestGreen}55`,
                    }}
                  >
                    <span style={{ fontSize: 28 }}>🎁</span>
                    <div
                      style={{
                        display: "flex",
                        fontSize: 32,
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    >
                      {itemCount} {Number(itemCount) === 1 ? "item" : "items"}
                    </div>
                  </div>
                )}
              </div>

              {/* Product images showcase */}
              {productImages.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 18,
                    marginTop: 8,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {productImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        backgroundColor: cardBg,
                        borderRadius: 14,
                        padding: 10,
                        boxShadow: `0 4px 16px ${forestGreen}22`,
                        border: `2px solid ${forestGreen}33`,
                      }}
                    >
                      <img
                        alt={`Product ${idx + 1}`}
                        height={130}
                        src={imgUrl}
                        width={130}
                        style={{
                          borderRadius: 10,
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Call to action - bottom section */}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 20,
              paddingBottom: 10,
              borderTop: `2px solid ${forestGreen}22`,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 20,
                color: forestGreen,
                fontWeight: 700,
              }}
            >
              wishlist.holiday
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Fredoka",
            data: fontRegular,
            style: "normal",
            weight: 500,
          },
          {
            name: "Fredoka",
            data: fontBold,
            style: "normal",
            weight: 700,
          },
        ],
      },
    );
  } catch (e: unknown) {
    console.error("Error generating OG image:", e);
    return new Response("Failed to generate the image", {
      status: 500,
    });
  }
}
