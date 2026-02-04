import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171717",
          borderRadius: "32px",
          fontSize: "80px",
          fontWeight: 800,
          color: "#fafafa",
        }}
      >
        IH
      </div>
    ),
    { ...size }
  );
}
