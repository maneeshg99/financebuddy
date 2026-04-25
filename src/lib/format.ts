export function safeNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  return n;
}

function isNil(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "number" && !Number.isFinite(v)) return true;
  return false;
}

export function fmtNum(v: unknown, digits = 2): string {
  if (isNil(v)) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtPct(v: unknown, digits = 2): string {
  if (isNil(v)) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `${(n * 100).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

export function fmtMoney(v: unknown, digits = 2): string {
  if (isNil(v)) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `$${n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function fmtCompact(v: unknown): string {
  if (isNil(v)) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(2)}K`;
  return `${sign}${abs.toFixed(2)}`;
}

export function fmtMoneyCompact(v: unknown): string {
  if (isNil(v)) return "—";
  const c = fmtCompact(v);
  return c === "—" ? "—" : `$${c}`;
}

export function fmtDate(v: unknown): string {
  if (isNil(v)) return "—";
  const d = typeof v === "string" || typeof v === "number" ? new Date(v) : v instanceof Date ? v : null;
  if (!d || Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function pctClass(v: unknown): string {
  if (isNil(v)) return "text-muted";
  const n = Number(v);
  if (!Number.isFinite(n)) return "text-muted";
  if (n > 0) return "text-up";
  if (n < 0) return "text-down";
  return "text-muted";
}

export function scoreClass(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) return "text-muted";
  if (score >= 70) return "text-up";
  if (score >= 45) return "text-warn";
  return "text-down";
}

export function scoreBg(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) return "bg-dim";
  if (score >= 70) return "bg-up";
  if (score >= 45) return "bg-warn";
  return "bg-down";
}

/**
 * Render a score driver's raw input value in its natural unit. Scoring
 * breakpoints in `score.ts` consume both ratios (PEG, P/E, debt/equity) and
 * fractions (margins, growth rates, FCF yield), so the renderer dispatches on
 * the driver label to match the unit a real analyst would expect.
 */
export function fmtDriverValue(label: string, value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";

  // Percent-natured drivers — the breakpoint table feeds them as fractions
  // (0.05 = 5%), so multiply for display.
  const pctLabels = new Set([
    "Revenue YoY",
    "Earnings YoY",
    "Revenue 3y CAGR",
    "EPS 5y CAGR",
    "Gross margin",
    "Operating margin",
    "FCF margin",
    "Return on equity",
    "FCF Yield",
    "Upside to target",
    "Price vs 50d MA",
    "Price vs 200d MA",
    "3-month return",
    "1-year return",
    "% from 52w high",
  ]);
  if (pctLabels.has(label)) return fmtPct(value, 1);

  // Pure ratios — render to 2dp, no unit
  const ratioLabels = new Set([
    "Forward P/E",
    "PEG",
    "EV/EBITDA",
    "Price/Book",
    "Debt/Equity",
    "Current ratio",
    "RSI(14)",
  ]);
  if (ratioLabels.has(label)) return fmtNum(value, 2);

  // Fallback — mostly catches custom drivers added later
  return fmtNum(value, 2);
}

/**
 * Empty-state hint per metric. Used in MetricsTable / sub-score rows when a
 * value is unavailable, so the cell reads `— (need ≥5y of EPS history)`
 * instead of a bare em-dash.
 */
export function emptyReason(label: string): string {
  const map: Record<string, string> = {
    "EPS 5y CAGR": "need ≥5y of EPS history",
    "Revenue 3y CAGR": "need ≥3y of revenue history",
    "Revenue YoY": "no prior-year revenue",
    "Earnings YoY": "no prior-year earnings",
    "PEG": "needs forward growth + P/E",
    "EV/EBITDA": "needs enterprise value + EBITDA",
    "Forward P/E": "no forward EPS estimate",
    "Price/Book": "needs book value per share",
    "FCF Yield": "no positive free cash flow",
    "Upside to target": "no analyst coverage",
    "RSI(14)": "needs ≥15 trading days",
    "Price vs 50d MA": "needs 50d moving average",
    "Price vs 200d MA": "needs 200d moving average",
    "3-month return": "needs ≥3 months of history",
    "1-year return": "needs ≥1 year of history",
    "% from 52w high": "no 52-week high",
    "Debt/Equity": "missing balance-sheet data",
    "Current ratio": "missing current assets / liabilities",
    "FCF margin": "no positive free cash flow",
    "Operating margin": "no operating income",
    "Return on equity": "no equity value",
    "Gross margin": "no gross profit",
  };
  return map[label] ?? "insufficient data";
}
