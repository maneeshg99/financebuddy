import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ff6600",
          fontWeight: 700,
          fontSize: 18,
          fontFamily: "monospace",
          letterSpacing: "-0.02em",
          border: "1px solid #ff6600",
        }}
      >
        FB
      </div>
    ),
    { ...size }
  );
}
