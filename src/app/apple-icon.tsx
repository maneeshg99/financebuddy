import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#ff6600",
          fontFamily: "monospace",
          border: "3px solid #ff6600",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: "-0.04em" }}>FB</div>
        <div style={{ fontSize: 16, color: "#7a7a7a", marginTop: 8 }}>FB-01</div>
      </div>
    ),
    { ...size }
  );
}
