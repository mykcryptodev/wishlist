import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") || "compound";
    const amountClaimed = searchParams.get("claimed") || "0";
    const amountBurned = searchParams.get("burned") || "0";
    const totalEarned = searchParams.get("totalEarned") || "0";
    const totalBurned = searchParams.get("totalBurned") || "0";
    const globalBurned = searchParams.get("globalBurned") || "0";

    const formatNumber = (num: string) => {
      const n = Number(num);
      if (n >= 1000000) {
        return `${(n / 1000000).toFixed(2)}M`;
      }
      if (n >= 1000) {
        return `${(n / 1000).toFixed(2)}K`;
      }
      return n.toFixed(2);
    };

    const getTitle = () => {
      switch (type) {
        case "compound":
          return "Compounded Rewards";
        case "claim":
          return "Claimed Rewards";
        case "burn":
          return "Burned Tokens";
        default:
          return "Stake Update";
      }
    };

    const getEmoji = () => {
      switch (type) {
        case "compound":
          return "⚡";
        case "claim":
          return "🎁";
        case "burn":
          return "🔥";
        default:
          return "🎯";
      }
    };

    // Get base URL for images
    const baseUrl =
      process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL}`
        : "http://localhost:3000";

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
            background: "linear-gradient(180deg, #D94A7A 0%, #E87BA3 100%)",
            fontFamily: "system-ui, sans-serif",
            position: "relative",
          }}
        >
          {/* Monster Image - Only show if burned */}
          {Number(amountBurned) > 0 && (
            <div
              style={{
                display: "flex",
                position: "absolute",
                bottom: "30px",
                left: "50px",
              }}
            >
              <img
                alt="Monster"
                height="200"
                src={`${baseUrl}/images/monster-santa-burn.png`}
                width="200"
                style={{
                  objectFit: "contain",
                  opacity: 0.7,
                }}
              />
            </div>
          )}

          {/* Wishlist Logo at Top */}
          <div
            style={{
              display: "flex",
              marginBottom: "40px",
            }}
          >
            <img
              alt="Wishlist"
              height="88"
              src={`${baseUrl}/images/lockup.png`}
              width="350"
              style={{
                objectFit: "contain",
              }}
            />
          </div>

          {/* This Transaction */}
          {(Number(amountClaimed) > 0 || Number(amountBurned) > 0) && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "rgba(0, 0, 0, 0.6)",
                borderRadius: "16px",
                padding: "20px 36px",
                backdropFilter: "blur(10px)",
                border: "4px solid rgba(255, 255, 255, 0.5)",
                width: "700px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "24px",
                  color: "rgba(255, 255, 255, 0.95)",
                  marginBottom: "14px",
                  fontWeight: "700",
                }}
              >
                This Transaction
              </div>
              {Number(amountClaimed) > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "30px",
                  }}
                >
                  <span style={{ color: "white", fontWeight: "500" }}>
                    {type === "compound" ? "Compounded:" : "Claimed:"}
                  </span>
                  <span
                    style={{
                      color: "#C4B5FD",
                      fontWeight: "bold",
                      textShadow: "0px 0px 20px rgba(167, 139, 250, 0.6)",
                    }}
                  >{`${formatNumber(amountClaimed)} WISH`}</span>
                </div>
              )}
              {Number(amountBurned) > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "30px",
                    marginTop: "8px",
                  }}
                >
                  <span style={{ color: "white", fontWeight: "500" }}>
                    Burned:
                  </span>
                  <span
                    style={{
                      color: "#FCD34D",
                      fontWeight: "bold",
                      textShadow: "0px 0px 20px rgba(251, 146, 60, 0.8)",
                    }}
                  >{`${formatNumber(amountBurned)} WISH`}</span>
                </div>
              )}
            </div>
          )}

          {/* My Stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "rgba(0, 0, 0, 0.55)",
              borderRadius: "16px",
              padding: "20px 36px",
              backdropFilter: "blur(10px)",
              border: "4px solid rgba(167, 139, 250, 0.7)",
              width: "700px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "24px",
                color: "rgba(255, 255, 255, 0.95)",
                marginBottom: "14px",
                fontWeight: "700",
              }}
            >
              My All-Time Stats
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "28px",
              }}
            >
              <span style={{ color: "white", fontWeight: "500" }}>
                Total Earned:
              </span>
              <span
                style={{
                  color: "#C4B5FD",
                  fontWeight: "bold",
                  textShadow: "0px 0px 20px rgba(167, 139, 250, 0.6)",
                }}
              >{`${formatNumber(totalEarned)} WISH`}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "28px",
                marginTop: "8px",
              }}
            >
              <span style={{ color: "white", fontWeight: "500" }}>
                Total Burned:
              </span>
              <span
                style={{
                  color: "#FCD34D",
                  fontWeight: "bold",
                  textShadow: "0px 0px 20px rgba(251, 146, 60, 0.8)",
                }}
              >{`${formatNumber(totalBurned)} WISH`}</span>
            </div>
          </div>

          {/* Global Stats */}
          <div
            style={{
              display: "flex",
              background: "rgba(0, 0, 0, 0.55)",
              borderRadius: "16px",
              padding: "20px 36px",
              backdropFilter: "blur(10px)",
              border: "4px solid rgba(251, 146, 60, 0.7)",
              width: "700px",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{ color: "white", fontWeight: "500", fontSize: "28px" }}
            >
              Global Burned:
            </span>
            <span
              style={{
                color: "#FCD34D",
                fontWeight: "bold",
                textShadow: "0px 0px 20px rgba(251, 146, 60, 0.8)",
                fontSize: "28px",
              }}
            >{`${formatNumber(globalBurned)} WISH`}</span>
          </div>

          {/* Footer - wishlist.holiday with stroke */}
          <div
            style={{
              marginTop: "28px",
              fontSize: "28px",
              fontWeight: "900",
              color: "white",
              textShadow:
                "3px 3px 0px #7C3AED, -1px -1px 0px #7C3AED, 1px -1px 0px #7C3AED, -1px 1px 0px #7C3AED",
              display: "flex",
            }}
          >
            wishlist.holiday
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
