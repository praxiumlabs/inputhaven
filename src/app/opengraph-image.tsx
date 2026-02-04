import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "InputHaven - The Most Affordable Form Backend";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <span
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#fafafa",
            }}
          >
            Input
          </span>
          <span
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "#3b82f6",
            }}
          >
            Haven
          </span>
        </div>
        <div
          style={{
            fontSize: "36px",
            fontWeight: 600,
            color: "#fafafa",
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: "900px",
          }}
        >
          The Most Affordable Form Backend as a Service
        </div>
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "40px",
          }}
        >
          {["500 Free/mo", "AI Spam Filter", "Email Routing", "Visual Builder"].map(
            (item) => (
              <div
                key={item}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  color: "#d4d4d4",
                  fontSize: "18px",
                }}
              >
                {item}
              </div>
            )
          )}
        </div>
        <div
          style={{
            marginTop: "40px",
            color: "#737373",
            fontSize: "20px",
          }}
        >
          inputhaven.com
        </div>
      </div>
    ),
    { ...size }
  );
}
