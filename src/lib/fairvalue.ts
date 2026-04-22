import type { FairValue, FairValueEstimate, FairValueVerdict, Snapshot } from "./types";

const DISCOUNT_RATE = 0.09;
const TERMINAL_GROWTH = 0.03;
const YEARS = 5;

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function median(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function pickGrowth(s: Snapshot): { g: number; source: string } {
  const c = s.revenueCagr3y;
  if (c !== null && Number.isFinite(c)) return { g: clamp(c, -0.05, 0.25), source: "rev 3y CAGR" };
  const rg = s.revenueGrowth;
  if (rg !== null && Number.isFinite(rg)) return { g: clamp(rg, -0.05, 0.25), source: "rev YoY" };
  const eg = s.earningsGrowth;
  if (eg !== null && Number.isFinite(eg)) return { g: clamp(eg, -0.05, 0.25), source: "earnings YoY" };
  return { g: 0.08, source: "default 8%" };
}

function dcfEquityValue(
  fcfStart: number,
  growth: number,
  years = YEARS,
  discount = DISCOUNT_RATE,
  terminal = TERMINAL_GROWTH
): number {
  let pv = 0;
  let fcf = fcfStart;
  for (let i = 1; i <= years; i++) {
    fcf = fcf * (1 + growth);
    pv += fcf / Math.pow(1 + discount, i);
  }
  const terminalFcf = fcf * (1 + terminal);
  const terminalValue = terminalFcf / (discount - terminal);
  pv += terminalValue / Math.pow(1 + discount, years);
  return pv;
}

function twoStageDCF(s: Snapshot): FairValueEstimate {
  if (!s.freeCashflow || s.freeCashflow <= 0 || !s.sharesOutstanding || s.sharesOutstanding <= 0) {
    return { method: "2-stage DCF", value: null, note: "skipped (need positive FCF + shares)" };
  }
  const { g, source } = pickGrowth(s);
  const equity = dcfEquityValue(s.freeCashflow, g);
  const perShare = equity / s.sharesOutstanding;
  return {
    method: "2-stage DCF",
    value: perShare,
    note: `g=${(g * 100).toFixed(1)}% (${source}), wacc 9%, terminal 3%`,
  };
}

function reverseDCF(s: Snapshot): FairValueEstimate {
  if (!s.freeCashflow || s.freeCashflow <= 0 || !s.marketCap || s.marketCap <= 0) {
    return { method: "Reverse DCF", value: null, note: "skipped (need positive FCF + market cap)" };
  }
  const target = s.marketCap;
  const fcf = s.freeCashflow;
  // Bisection on growth ∈ [-0.10, 0.40]
  let lo = -0.1;
  let hi = 0.4;
  const vAt = (g: number) => dcfEquityValue(fcf, g);
  const vLo = vAt(lo);
  const vHi = vAt(hi);
  if ((vLo - target) * (vHi - target) > 0) {
    // target outside the bracket — report endpoint best-effort
    const guess = vLo > target ? lo : hi;
    return {
      method: "Reverse DCF",
      value: null,
      note: `market is pricing in ≥${(guess * 100).toFixed(1)}% growth (outside search range)`,
    };
  }
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const v = vAt(mid);
    if (Math.abs(v - target) < target * 1e-4) {
      return {
        method: "Reverse DCF",
        value: null,
        note: `market is pricing in ~${(mid * 100).toFixed(1)}% growth (informational)`,
      };
    }
    if (v < target) lo = mid;
    else hi = mid;
  }
  const finalG = (lo + hi) / 2;
  return {
    method: "Reverse DCF",
    value: null,
    note: `market is pricing in ~${(finalG * 100).toFixed(1)}% growth (informational)`,
  };
}

function grahamNumber(s: Snapshot): FairValueEstimate {
  const eps = s.trailingEps;
  const bvps = s.bookValuePerShare;
  if (!eps || eps <= 0 || !bvps || bvps <= 0) {
    return { method: "Graham number", value: null, note: "skipped (need positive EPS + BVPS)" };
  }
  const v = Math.sqrt(22.5 * eps * bvps);
  return { method: "Graham number", value: v, note: "√(22.5 × EPS × BVPS)" };
}

function peBased(s: Snapshot): FairValueEstimate {
  const eps = s.forwardEps ?? s.trailingEps;
  const which = s.forwardEps ? "fwd" : s.trailingEps ? "trailing" : null;
  if (!which || !eps || eps <= 0) {
    return { method: "P/E based", value: null, note: "skipped (need positive EPS)" };
  }
  return { method: "P/E based", value: eps * 18, note: `${which} EPS × 18× target P/E` };
}

function analystTarget(s: Snapshot): FairValueEstimate {
  if (!s.targetMeanPrice || !s.numberOfAnalysts) {
    return { method: "Analyst mean target", value: null, note: "skipped (no coverage)" };
  }
  return {
    method: "Analyst mean target",
    value: s.targetMeanPrice,
    note: `${s.numberOfAnalysts} analyst${s.numberOfAnalysts === 1 ? "" : "s"}`,
  };
}

export function buildFairValue(s: Snapshot): FairValue {
  const estimates: FairValueEstimate[] = [
    twoStageDCF(s),
    reverseDCF(s),
    grahamNumber(s),
    peBased(s),
    analystTarget(s),
  ];

  const priced = estimates.map((e) => e.value).filter((v): v is number => v !== null && Number.isFinite(v) && v > 0);

  if (priced.length === 0) {
    return {
      low: null,
      mid: null,
      high: null,
      verdict: "Insufficient data" as FairValueVerdict,
      upsidePct: null,
      estimates,
    };
  }

  const low = Math.min(...priced);
  const high = Math.max(...priced);
  const mid = median(priced);

  const price = s.price;
  let verdict: FairValueVerdict = "Fair";
  if (price !== null && Number.isFinite(price)) {
    if (price < low) verdict = "Undervalued";
    else if (price > high) verdict = "Overvalued";
    else verdict = "Fair";
  }

  const upsidePct = price && mid ? (mid - price) / price : null;

  return { low, mid, high, verdict, upsidePct, estimates };
}
