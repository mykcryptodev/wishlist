import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const name = searchParams.get("name");
    const itemCount = searchParams.get("itemCount") || "0";

    // Determine if this is a generic "create your wishlist" page or a specific user's wishlist
    const isGeneric = !address;

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
              backgroundColor: "#000",
              backgroundImage:
                "linear-gradient(135deg, #000 0%, #1a1a2e 50%, #16213e 100%)",
              padding: "40px 80px",
              position: "relative",
            }}
          >
            {/* Decorative floating gifts */}
            <div
              style={{
                position: "absolute",
                top: 60,
                left: 100,
                fontSize: 50,
                opacity: 0.5,
              }}
            >
              🎁
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
              🎀
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
              ✨
            </div>

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
                  fontSize: 70,
                  fontWeight: 700,
                  background: "linear-gradient(to right, #fff, #c8c8c8)",
                  backgroundClip: "text",
                  color: "transparent",
                  textAlign: "center",
                }}
              >
                Create Your Perfect
              </div>

              <div
                style={{
                  display: "flex",
                  fontSize: 120,
                  fontWeight: 900,
                  background:
                    "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                  backgroundClip: "text",
                  color: "transparent",
                  textAlign: "center",
                  letterSpacing: "-4px",
                }}
              >
                Wishlist
              </div>

              <div
                style={{
                  display: "flex",
                  fontSize: 32,
                  color: "#888",
                  textAlign: "center",
                  marginTop: 20,
                  maxWidth: 800,
                }}
              >
                Gift coordination made easy • Share with family & friends
              </div>
            </div>

            {/* Bottom app name */}
            <div
              style={{
                display: "flex",
                position: "absolute",
                bottom: 50,
                fontSize: 28,
                color: "#667eea",
                fontWeight: 700,
              }}
            >
              Wishlist App
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
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
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
            backgroundImage:
              "linear-gradient(135deg, #000 0%, #1a1a2e 50%, #16213e 100%)",
            padding: "40px 80px",
            position: "relative",
          }}
        >
          {/* Top decorative element */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 40,
              left: 80,
              fontSize: 60,
            }}
          >
            🎁
          </div>

          {/* Decorative elements */}
          <div
            style={{
              position: "absolute",
              top: 50,
              right: 100,
              fontSize: 40,
              opacity: 0.4,
            }}
          >
            ✨
          </div>

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
            {/* Title */}
            <div
              style={{
                display: "flex",
                fontSize: 80,
                fontWeight: 900,
                background: "linear-gradient(to right, #fff, #a8a8a8)",
                backgroundClip: "text",
                color: "transparent",
                textAlign: "center",
                letterSpacing: "-2px",
              }}
            >
              {displayName}&apos;s
            </div>

            {/* Wishlist */}
            <div
              style={{
                display: "flex",
                fontSize: 100,
                fontWeight: 900,
                background:
                  "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                backgroundClip: "text",
                color: "transparent",
                textAlign: "center",
                letterSpacing: "-3px",
              }}
            >
              Wishlist
            </div>

            {/* Item count badge */}
            {itemCount && Number(itemCount) > 0 && (
              <div
                style={{
                  display: "flex",
                  backgroundColor: "#667eea",
                  borderRadius: 50,
                  padding: "20px 40px",
                  fontSize: 40,
                  color: "#fff",
                  fontWeight: 700,
                  marginTop: 20,
                  boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
                }}
              >
                {itemCount} {Number(itemCount) === 1 ? "item" : "items"}
              </div>
            )}

            {/* Call to action */}
            <div
              style={{
                display: "flex",
                fontSize: 28,
                color: "#888",
                marginTop: 20,
              }}
            >
              Browse & mark items you&apos;d like to gift
            </div>
          </div>

          {/* Bottom app name */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              bottom: 40,
              right: 80,
              fontSize: 30,
              color: "#667eea",
              fontWeight: 700,
            }}
          >
            Wishlist App
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: unknown) {
    console.error("Error generating OG image:", e);
    return new Response("Failed to generate the image", {
      status: 500,
    });
  }
}
