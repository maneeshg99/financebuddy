import { ImageResponse } from "next/og";
import { fetchSnapshot, normalizeSymbol } from "@/lib/yahoo";
import { buildScoreReport } from "@/lib/score";
import { fmtMoney, fmtPct } from "@/lib/format";

export const runtime = "nodejs";
export const alt = "FinanceBuddy ticker summary";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function verdictColor(score: number | null): string {
  if (score === null) return "#cfcfcf";
  if (score >= 70) return "#1aff1a";
  if (score >= 45) return "#ffd500";
  return "#ff3333";
}

function changeColor(v: number | null | undefined): string {
  if (v === null || v === undefined) return "#cfcfcf";
  if (v > 0) return "#1aff1a";
  if (v < 0) return "#ff3333";
  return "#cfcfcf";
}

export default async function OG({ params }: { params: { ticker: string } }) {
  const raw = decodeURIComponent(params.ticker);
  const symbol = normalizeSymbol(raw);

  let snap: Awaited<ReturnType<typeof fetchSnapshot>> | null = null;
  try {
    snap = await fetchSnapshot(symbol);
  } catch {
    snap = null;
  }
  const composite = snap ? buildScoreReport(snap).composite : null;
  const changeSign = snap?.change !== null && snap?.change !== undefined && snap.change >= 0 ? "+" : "";

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

        {/* symbol + name */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 60, gap: 12 }}>
          <div style={{ display: "flex", fontSize: 32, color: "#ff6600", letterSpacing: "0.08em" }}>
            {`/// TARGET ACQUIRED /// SYM = ${symbol}`}
          </div>
          <div style={{ display: "flex", fontSize: 120, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1 }}>
            {symbol}
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#cfcfcf", maxWidth: 900 }}>
            {snap?.name ?? symbol}
          </div>
        </div>

        {/* price + score rows */}
        <div style={{ display: "flex", marginTop: 50, gap: 60, alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", fontSize: 18, color: "#ff6600", letterSpacing: "0.15em" }}>
              PX LAST
            </div>
            <div style={{ display: "flex", fontSize: 80, fontWeight: 700, color: "#ffd500", letterSpacing: "-0.02em" }}>
              {fmtMoney(snap?.price ?? null)}
            </div>
            <div style={{ display: "flex", fontSize: 26, color: changeColor(snap?.changePct) }}>
              {`${changeSign}${fmtMoney(snap?.change ?? null)} (${fmtPct(snap?.changePct ?? null, 2)})`}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", fontSize: 18, color: "#ff6600", letterSpacing: "0.15em" }}>
              FB SCORE
            </div>
            <div style={{ display: "flex", fontSize: 80, fontWeight: 700, color: verdictColor(composite), letterSpacing: "-0.02em", alignItems: "baseline" }}>
              <div style={{ display: "flex" }}>{composite ?? "—"}</div>
              <div style={{ display: "flex", fontSize: 32, color: "#7a7a7a", marginLeft: 8 }}>/100</div>
            </div>
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
          <div style={{ display: "flex" }}>FINANCEBUDDY /// ONE TICKER /// FULL PICTURE</div>
          <div style={{ display: "flex", color: "#ff6600" }}>© 2026</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
