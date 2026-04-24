import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FinanceBuddy — one ticker, full picture";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 64,
          fontFamily: "monospace",
          color: "#f0f0f0",
          position: "relative",
        }}
      >
        {/* top ribbon */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: "#7a7a7a" }}>
          <div style={{ display: "flex" }}>
            {"<HELP> HELP    <MENU> FAVS    <GO> LOAD"}
          </div>
          <div style={{ display: "flex", color: "#ff6600" }}>FB-01 EQUITY</div>
        </div>

        <div style={{ display: "flex", height: 2, background: "#ff6600", marginTop: 20 }} />

        {/* headline block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 80,
            gap: 20,
          }}
        >
          <div style={{ display: "flex", fontSize: 36, color: "#ff6600", letterSpacing: "0.08em" }}>
            FINANCEBUDDY
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              gap: 16,
            }}
          >
            <div style={{ display: "flex" }}>ONE TICKER ///</div>
            <div style={{ display: "flex", color: "#ffd500" }}>FULL PICTURE</div>
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#cfcfcf", maxWidth: 900, lineHeight: 1.3, marginTop: 24 }}>
            Composite 0-100 score, fair-value band, and catalysts — all on one page.
          </div>
        </div>

        {/* bottom strip */}
        <div
          style={{
            position: "absolute",
            bottom: 64,
            left: 64,
            right: 64,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#7a7a7a",
          }}
        >
          <div style={{ display: "flex" }}>{"/// UNIT FB-01 /// STATUS NOMINAL"}</div>
          <div style={{ display: "flex", color: "#ff6600" }}>© 2026 FB-TERMINAL</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
