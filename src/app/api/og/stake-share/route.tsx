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
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 100%)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "40px",
            }}
          >
            <div style={{ fontSize: "80px" }}>{getEmoji()}</div>
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              {getTitle()}
            </div>
          </div>

          {/* This Transaction */}
          {(amountClaimed !== "0" || amountBurned !== "0") && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "24px 40px",
                borderRadius: "16px",
                marginBottom: "24px",
                width: "600px",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  color: "#999",
                  marginBottom: "8px",
                }}
              >
                This Transaction
              </div>
              {type === "compound" && amountClaimed !== "0" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "28px",
                  }}
                >
                  <span style={{ color: "#ccc" }}>Compounded:</span>
                  <span
                    style={{ color: "#8b5cf6", fontWeight: "bold" }}
                  >{`${formatNumber(amountClaimed)} WISH`}</span>
                </div>
              )}
              {type === "claim" && amountClaimed !== "0" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "28px",
                  }}
                >
                  <span style={{ color: "#ccc" }}>Claimed:</span>
                  <span
                    style={{ color: "#22c55e", fontWeight: "bold" }}
                  >{`${formatNumber(amountClaimed)} WISH`}</span>
                </div>
              )}
              {amountBurned !== "0" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "28px",
                  }}
                >
                  <span style={{ color: "#ccc" }}>Burned:</span>
                  <span
                    style={{ color: "#f97316", fontWeight: "bold" }}
                  >{`${formatNumber(amountBurned)} WISH`}</span>
                </div>
              )}
            </div>
          )}

          {/* All-Time Stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              background: "rgba(139, 92, 246, 0.1)",
              padding: "24px 40px",
              borderRadius: "16px",
              width: "600px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{ fontSize: "24px", color: "#999", marginBottom: "8px" }}
            >
              My All-Time Stats
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "24px",
              }}
            >
              <span style={{ color: "#ccc" }}>Total Earned:</span>
              <span
                style={{ color: "#8b5cf6", fontWeight: "bold" }}
              >{`${formatNumber(totalEarned)} WISH`}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "24px",
              }}
            >
              <span style={{ color: "#ccc" }}>Total Burned:</span>
              <span
                style={{ color: "#f97316", fontWeight: "bold" }}
              >{`${formatNumber(totalBurned)} WISH`}</span>
            </div>
          </div>

          {/* Global Stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              background: "rgba(249, 115, 22, 0.1)",
              padding: "20px 40px",
              borderRadius: "16px",
              width: "600px",
              fontSize: "24px",
            }}
          >
            <span style={{ color: "#ccc" }}>Global Total Burned:</span>
            <span
              style={{ color: "#f97316", fontWeight: "bold" }}
            >{`${formatNumber(globalBurned)} WISH`}</span>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: "40px",
              fontSize: "28px",
              color: "#666",
            }}
          >
            wishlist.lol
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
