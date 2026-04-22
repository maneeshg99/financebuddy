import type { Driver, ScoreReport, Snapshot, SubScore } from "./types";

type Breakpoint = [number, number]; // [input, score 0-100]

function interpolate(input: number | null | undefined, breakpoints: Breakpoint[]): number | null {
  if (input === null || input === undefined || !Number.isFinite(input)) return null;
  if (breakpoints.length === 0) return null;
  const sorted = [...breakpoints].sort((a, b) => a[0] - b[0]);
  if (input <= sorted[0][0]) return sorted[0][1];
  if (input >= sorted[sorted.length - 1][0]) return sorted[sorted.length - 1][1];
  for (let i = 1; i < sorted.length; i++) {
    const [x1, y1] = sorted[i - 1];
    const [x2, y2] = sorted[i];
    if (input >= x1 && input <= x2) {
      if (x2 === x1) return y1;
      const t = (input - x1) / (x2 - x1);
      return y1 + t * (y2 - y1);
    }
  }
  return null;
}

function roundMaybe(n: number | null): number | null {
  if (n === null || !Number.isFinite(n)) return null;
  return Math.round(n);
}

// Weighted average over drivers that have non-null scores; re-normalizes weights
function aggregate(drivers: Array<{ score: number | null; weight: number }>): number | null {
  let wSum = 0;
  let scoreSum = 0;
  for (const d of drivers) {
    if (d.score === null) continue;
    wSum += d.weight;
    scoreSum += d.score * d.weight;
  }
  if (wSum === 0) return null;
  return scoreSum / wSum;
}

function driver(
  label: string,
  value: number | null,
  breakpoints: Breakpoint[],
  note?: string
): Driver {
  const s = interpolate(value, breakpoints);
  return { label, value, score: roundMaybe(s), note };
}

function buildValue(s: Snapshot): SubScore {
  const pe = s.forwardPE ?? s.trailingPE;
  const peUpside =
    s.price && s.targetMeanPrice && s.numberOfAnalysts
      ? (s.targetMeanPrice - s.price) / s.price
      : null;

  const fcfYield =
    s.freeCashflow !== null && s.marketCap && s.marketCap > 0 ? s.freeCashflow / s.marketCap : null;

  const drivers: Array<{ driver: Driver; weight: number }> = [
    {
      driver: driver(
        "Forward P/E",
        pe,
        [
          [5, 100],
          [10, 90],
          [15, 75],
          [20, 60],
          [25, 45],
          [35, 25],
          [60, 5],
          [120, 0],
        ],
        s.forwardPE !== null ? "forward" : s.trailingPE !== null ? "trailing fallback" : undefined
      ),
      weight: 0.25,
    },
    {
      driver: driver(
        "PEG",
        s.pegRatio,
        [
          [0, 50],
          [0.5, 95],
          [1, 80],
          [1.5, 60],
          [2, 45],
          [3, 20],
          [5, 0],
        ]
      ),
      weight: 0.2,
    },
    {
      driver: driver(
        "EV/EBITDA",
        s.evToEbitda,
        [
          [3, 100],
          [6, 90],
          [10, 75],
          [14, 55],
          [20, 30],
          [30, 10],
          [50, 0],
        ]
      ),
      weight: 0.2,
    },
    {
      driver: driver(
        "Price/Book",
        s.priceToBook,
        [
          [0.5, 100],
          [1, 90],
          [2, 75],
          [3, 55],
          [5, 35],
          [10, 10],
          [20, 0],
        ]
      ),
      weight: 0.1,
    },
    {
      driver: driver(
        "FCF Yield",
        fcfYield,
        [
          [-0.05, 0],
          [0, 30],
          [0.02, 55],
          [0.04, 75],
          [0.06, 90],
          [0.1, 100],
        ]
      ),
      weight: 0.15,
    },
    {
      driver: driver(
        "Upside to target",
        peUpside,
        [
          [-0.3, 0],
          [-0.1, 30],
          [0, 50],
          [0.1, 70],
          [0.25, 90],
          [0.5, 100],
        ]
      ),
      weight: 0.1,
    },
  ];

  const score = aggregate(drivers.map((d) => ({ score: d.driver.score, weight: d.weight })));
  return {
    pillar: "Value",
    score: roundMaybe(score),
    weight: 0.3,
    drivers: drivers.map((d) => d.driver),
  };
}

function buildGrowth(s: Snapshot): SubScore {
  const drivers: Array<{ driver: Driver; weight: number }> = [
    {
      driver: driver(
        "Revenue YoY",
        s.revenueGrowth,
        [
          [-0.2, 0],
          [-0.05, 25],
          [0, 40],
          [0.05, 55],
          [0.1, 70],
          [0.2, 85],
          [0.3, 95],
          [0.5, 100],
        ]
      ),
      weight: 0.3,
    },
    {
      driver: driver(
        "Revenue 3y CAGR",
        s.revenueCagr3y,
        [
          [-0.1, 0],
          [0, 30],
          [0.05, 50],
          [0.1, 65],
          [0.15, 80],
          [0.25, 95],
          [0.4, 100],
        ]
      ),
      weight: 0.2,
    },
    {
      driver: driver(
        "Earnings YoY",
        s.earningsGrowth,
        [
          [-0.3, 0],
          [-0.1, 25],
          [0, 45],
          [0.1, 65],
          [0.2, 80],
          [0.4, 95],
          [0.75, 100],
        ]
      ),
      weight: 0.2,
    },
    {
      driver: driver(
        "EPS 5y CAGR",
        s.epsCagr5y,
        [
          [-0.2, 0],
          [0, 35],
          [0.05, 50],
          [0.1, 65],
          [0.2, 85],
          [0.35, 100],
        ]
      ),
      weight: 0.15,
    },
    {
      driver: driver(
        "Gross margin",
        s.grossMargin,
        [
          [0, 0],
          [0.2, 35],
          [0.35, 60],
          [0.5, 80],
          [0.7, 95],
          [0.85, 100],
        ]
      ),
      weight: 0.15,
    },
  ];
  const score = aggregate(drivers.map((d) => ({ score: d.driver.score, weight: d.weight })));
  return {
    pillar: "Growth",
    score: roundMaybe(score),
    weight: 0.25,
    drivers: drivers.map((d) => d.driver),
  };
}

function buildMomentum(s: Snapshot): SubScore {
  const pctVs50 =
    s.price && s.fiftyDayAverage && s.fiftyDayAverage > 0
      ? (s.price - s.fiftyDayAverage) / s.fiftyDayAverage
      : null;
  const pctVs200 =
    s.price && s.twoHundredDayAverage && s.twoHundredDayAverage > 0
      ? (s.price - s.twoHundredDayAverage) / s.twoHundredDayAverage
      : null;

  const drivers: Array<{ driver: Driver; weight: number }> = [
    {
      driver: driver(
        "Price vs 50d MA",
        pctVs50,
        [
          [-0.2, 0],
          [-0.1, 25],
          [-0.02, 45],
          [0, 55],
          [0.05, 70],
          [0.1, 85],
          [0.2, 100],
        ]
      ),
      weight: 0.2,
    },
    {
      driver: driver(
        "Price vs 200d MA",
        pctVs200,
        [
          [-0.3, 0],
          [-0.15, 25],
          [-0.05, 45],
          [0, 55],
          [0.1, 75],
          [0.25, 90],
          [0.5, 100],
        ]
      ),
      weight: 0.2,
    },
    {
      driver: driver(
        "RSI(14)",
        s.rsi14,
        [
          [10, 30],
          [25, 55],
          [35, 70],
          [50, 85],
          [60, 90],
          [70, 70],
          [80, 40],
          [90, 10],
        ]
      ),
      weight: 0.15,
    },
    {
      driver: driver(
        "3-month return",
        s.perf3m,
        [
          [-0.3, 0],
          [-0.1, 30],
          [0, 50],
          [0.05, 65],
          [0.15, 85],
          [0.3, 100],
        ]
      ),
      weight: 0.15,
    },
    {
      driver: driver(
        "1-year return",
        s.perf1y,
        [
          [-0.4, 0],
          [-0.15, 25],
          [0, 50],
          [0.1, 65],
          [0.25, 80],
          [0.5, 95],
          [1.0, 100],
        ]
      ),
      weight: 0.2,
    },
    {
      driver: driver(
        "% from 52w high",
        s.pctFromHigh,
        [
          [-0.5, 25],
          [-0.3, 45],
          [-0.15, 65],
          [-0.05, 85],
          [0, 90],
          [0.05, 75],
        ]
      ),
      weight: 0.1,
    },
  ];

  const score = aggregate(drivers.map((d) => ({ score: d.driver.score, weight: d.weight })));
  return {
    pillar: "Momentum",
    score: roundMaybe(score),
    weight: 0.25,
    drivers: drivers.map((d) => d.driver),
  };
}

function buildQuality(s: Snapshot): SubScore {
  const drivers: Array<{ driver: Driver; weight: number }> = [
    {
      driver: driver(
        "Debt/Equity",
        s.debtToEquity,
        [
          [0, 100],
          [0.3, 90],
          [0.6, 75],
          [1.0, 60],
          [1.5, 40],
          [2.5, 20],
          [4.0, 0],
        ]
      ),
      weight: 0.25,
    },
    {
      driver: driver(
        "Current ratio",
        s.currentRatio,
        [
          [0.5, 0],
          [1.0, 40],
          [1.5, 70],
          [2.0, 90],
          [3.0, 100],
        ]
      ),
      weight: 0.15,
    },
    {
      driver: driver(
        "FCF margin",
        s.fcfMargin,
        [
          [-0.1, 0],
          [0, 35],
          [0.05, 55],
          [0.1, 70],
          [0.2, 90],
          [0.3, 100],
        ]
      ),
      weight: 0.25,
    },
    {
      driver: driver(
        "Operating margin",
        s.operatingMargin,
        [
          [-0.1, 0],
          [0, 35],
          [0.05, 50],
          [0.1, 65],
          [0.2, 85],
          [0.35, 100],
        ]
      ),
      weight: 0.15,
    },
    {
      driver: driver(
        "Return on equity",
        s.returnOnEquity,
        [
          [-0.1, 0],
          [0, 30],
          [0.05, 50],
          [0.1, 65],
          [0.15, 80],
          [0.25, 95],
          [0.4, 100],
        ]
      ),
      weight: 0.2,
    },
  ];

  const score = aggregate(drivers.map((d) => ({ score: d.driver.score, weight: d.weight })));
  return {
    pillar: "Quality",
    score: roundMaybe(score),
    weight: 0.2,
    drivers: drivers.map((d) => d.driver),
  };
}

function tone(score: number | null, strong: string, moderate: string, weak: string): string {
  if (score === null) return moderate; // fall back gracefully
  if (score >= 70) return strong;
  if (score >= 45) return moderate;
  return weak;
}

function buildThesis(name: string, subs: SubScore[]): string {
  const value = subs.find((s) => s.pillar === "Value")?.score ?? null;
  const growth = subs.find((s) => s.pillar === "Growth")?.score ?? null;
  const momentum = subs.find((s) => s.pillar === "Momentum")?.score ?? null;
  const quality = subs.find((s) => s.pillar === "Quality")?.score ?? null;

  const valueTone = tone(value, "attractively valued", "fairly valued", "richly valued");
  const growthTone = tone(growth, "strong growth", "modest growth", "soft growth");
  const momentumTone = tone(momentum, "positive momentum", "mixed momentum", "weak momentum");
  const qualityTone = tone(quality, "high-quality book", "decent quality book", "low-quality book");

  const candidates: Array<[string, number | null]> = [
    ["Value", value],
    ["Growth", growth],
    ["Momentum", momentum],
    ["Quality", quality],
  ];
  const ranked = candidates
    .filter(([, v]) => v !== null)
    .sort((a, b) => (b[1] as number) - (a[1] as number));
  const top = ranked[0];

  const base = `${name} screens as ${valueTone} with ${growthTone}, ${momentumTone}, and a ${qualityTone}.`;
  if (!top) return `${base} Signals are limited — data is incomplete.`;
  return `${base} Strongest signal: ${top[0]} (${top[1]}/100).`;
}

export function buildScoreReport(snapshot: Snapshot): ScoreReport {
  const subs: SubScore[] = [
    buildValue(snapshot),
    buildGrowth(snapshot),
    buildMomentum(snapshot),
    buildQuality(snapshot),
  ];

  // Composite with fixed pillar weights (Value 0.30, Growth 0.25, Momentum 0.25, Quality 0.20)
  // Skip pillars that have no score at all and renormalize.
  const agg = aggregate(subs.map((s) => ({ score: s.score, weight: s.weight })));

  const name = snapshot.name ?? snapshot.symbol;

  return {
    composite: roundMaybe(agg),
    thesis: buildThesis(name, subs),
    subscores: subs,
  };
}
