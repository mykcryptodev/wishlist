import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Cache the OG image for 1 hour
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const name = searchParams.get("name");
    const itemCount = searchParams.get("itemCount") || "0";

    // Determine if this is a generic "create your wishlist" page or a specific user's wishlist
    const isGeneric = !address;

    // Christmas theme colors from globals.css
    const forestGreen = "#468763"; // oklch(0.55 0.16 155)
    const gold = "#c0a053"; // oklch(0.68 0.14 85)
    const pineGreen = "#3d7357"; // oklch(0.50 0.14 165)
    const background = "#262626"; // oklch(0.15 0.02 25)
    const cardBg = "#383838"; // oklch(0.22 0.02 25)

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
              backgroundColor: background,
              backgroundImage: `radial-gradient(circle at 20% 50%, ${forestGreen}22 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${gold}22 0%, transparent 50%), radial-gradient(circle at 40% 20%, ${pineGreen}22 0%, transparent 50%)`,
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
                opacity: 0.4,
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
                opacity: 0.3,
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
                opacity: 0.3,
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
                    color: "#fff",
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
                  color: "#9ca3af",
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

    // User-specific wishlist OG image
    const displayName =
      name ||
      (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Anonymous");

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: background,
            backgroundImage: `radial-gradient(circle at 20% 50%, ${forestGreen}22 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${gold}22 0%, transparent 50%), radial-gradient(circle at 40% 20%, ${pineGreen}22 0%, transparent 50%)`,
            padding: "50px 80px",
            position: "relative",
            fontFamily: "Fredoka, sans-serif",
          }}
        >
          {/* Christmas decorative emojis */}
          <div
            style={{
              position: "absolute",
              top: 50,
              left: 80,
              fontSize: 50,
              opacity: 0.4,
            }}
          >
            🎄
          </div>
          <div
            style={{
              position: "absolute",
              top: 50,
              right: 100,
              fontSize: 45,
              opacity: 0.3,
            }}
          >
            🎅
          </div>

          {/* Monster image */}
          <img
            alt="Monster"
            height={140}
            src={monsterDataUrl}
            width={140}
            style={{
              position: "absolute",
              bottom: 60,
              right: 80,
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
              flex: 1,
              gap: 30,
            }}
          >
            {/* Card container */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: cardBg,
                borderRadius: 24,
                padding: "50px 60px",
                border: `2px solid ${forestGreen}44`,
                boxShadow: `0 8px 32px ${forestGreen}33`,
              }}
            >
              {/* Owner name */}
              <div
                style={{
                  display: "flex",
                  fontSize: 72,
                  fontWeight: 700,
                  background: `linear-gradient(90deg, ${forestGreen} 0%, ${gold} 50%, ${pineGreen} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  textAlign: "center",
                  letterSpacing: "-2px",
                  marginBottom: 10,
                }}
              >
                {displayName}&apos;s Wishlist
              </div>

              {/* Item count badge */}
              {itemCount && Number(itemCount) > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 15,
                    backgroundColor: forestGreen,
                    borderRadius: 50,
                    padding: "20px 45px",
                    marginTop: 20,
                    boxShadow: `0 4px 24px ${forestGreen}66`,
                  }}
                >
                  <span style={{ fontSize: 40 }}>🎁</span>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 42,
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    {itemCount} {Number(itemCount) === 1 ? "item" : "items"}
                  </div>
                </div>
              )}
            </div>

            {/* Call to action */}
            <div
              style={{
                display: "flex",
                fontSize: 32,
                color: gold,
                marginTop: 10,
                fontWeight: 500,
              }}
            >
              ✨ Browse & mark items you&apos;d like to gift ✨
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 20,
              paddingTop: 20,
              borderTop: `1px solid ${forestGreen}44`,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: "#9ca3af",
              }}
            >
              Built by myk.eth
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 24,
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
