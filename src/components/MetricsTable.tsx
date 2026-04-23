import type { Snapshot } from "@/lib/types";
import { fmtMoney, fmtMoneyCompact, fmtNum, fmtPct, pctClass } from "@/lib/format";

type Row = { label: string; value: string; cls?: string };
type Panel = { title: string; rows: Row[] };

function build(snap: Snapshot): Panel[] {
  const fcfYield =
    snap.freeCashflow !== null && snap.marketCap && snap.marketCap > 0
      ? snap.freeCashflow / snap.marketCap
      : null;
  const pctVs50 =
    snap.price && snap.fiftyDayAverage && snap.fiftyDayAverage > 0
      ? (snap.price - snap.fiftyDayAverage) / snap.fiftyDayAverage
      : null;
  const pctVs200 =
    snap.price && snap.twoHundredDayAverage && snap.twoHundredDayAverage > 0
      ? (snap.price - snap.twoHundredDayAverage) / snap.twoHundredDayAverage
      : null;
  const upside =
    snap.targetMeanPrice && snap.price ? (snap.targetMeanPrice - snap.price) / snap.price : null;

  return [
    {
      title: "Valuation",
      rows: [
        { label: "Market cap", value: fmtMoneyCompact(snap.marketCap) },
        { label: "Enterprise value", value: fmtMoneyCompact(snap.enterpriseValue) },
        { label: "Trailing P/E", value: fmtNum(snap.trailingPE) },
        { label: "Forward P/E", value: fmtNum(snap.forwardPE) },
        { label: "PEG", value: fmtNum(snap.pegRatio) },
        { label: "P/B", value: fmtNum(snap.priceToBook) },
        { label: "P/S", value: fmtNum(snap.priceToSales) },
        { label: "EV/EBITDA", value: fmtNum(snap.evToEbitda) },
      ],
    },
    {
      title: "Profitability",
      rows: [
        { label: "Gross margin", value: fmtPct(snap.grossMargin, 1) },
        { label: "Operating margin", value: fmtPct(snap.operatingMargin, 1) },
        { label: "Profit margin", value: fmtPct(snap.profitMargin, 1) },
        { label: "FCF margin", value: fmtPct(snap.fcfMargin, 1) },
        { label: "Return on equity", value: fmtPct(snap.returnOnEquity, 1) },
        { label: "Return on assets", value: fmtPct(snap.returnOnAssets, 1) },
      ],
    },
    {
      title: "Balance sheet",
      rows: [
        { label: "Total cash", value: fmtMoneyCompact(snap.totalCash) },
        { label: "Total debt", value: fmtMoneyCompact(snap.totalDebt) },
        { label: "Debt / equity", value: fmtNum(snap.debtToEquity) },
        { label: "Current ratio", value: fmtNum(snap.currentRatio) },
        { label: "Quick ratio", value: fmtNum(snap.quickRatio) },
      ],
    },
    {
      title: "Cash & yield",
      rows: [
        { label: "Operating CF", value: fmtMoneyCompact(snap.operatingCashflow) },
        { label: "Free cash flow", value: fmtMoneyCompact(snap.freeCashflow) },
        { label: "FCF yield", value: fmtPct(fcfYield, 2) },
        { label: "Dividend yield", value: fmtPct(snap.dividendYield, 2) },
        { label: "Payout ratio", value: fmtPct(snap.payoutRatio, 1) },
      ],
    },
    {
      title: "Growth",
      rows: [
        { label: "Revenue YoY", value: fmtPct(snap.revenueGrowth, 1), cls: pctClass(snap.revenueGrowth) },
        { label: "Earnings YoY", value: fmtPct(snap.earningsGrowth, 1), cls: pctClass(snap.earningsGrowth) },
        { label: "Revenue 3y CAGR", value: fmtPct(snap.revenueCagr3y, 1), cls: pctClass(snap.revenueCagr3y) },
        { label: "EPS 5y CAGR", value: fmtPct(snap.epsCagr5y, 1), cls: pctClass(snap.epsCagr5y) },
        { label: "Revenue (TTM)", value: fmtMoneyCompact(snap.totalRevenue) },
        { label: "EBITDA", value: fmtMoneyCompact(snap.ebitda) },
      ],
    },
    {
      title: "Per share",
      rows: [
        { label: "Trailing EPS", value: fmtMoney(snap.trailingEps) },
        { label: "Forward EPS", value: fmtMoney(snap.forwardEps) },
        { label: "Book value / share", value: fmtMoney(snap.bookValuePerShare) },
        { label: "Shares outstanding", value: snap.sharesOutstanding ? fmtMoneyCompact(snap.sharesOutstanding).replace("$", "") : "—" },
      ],
    },
    {
      title: "Momentum",
      rows: [
        { label: "vs 50d MA", value: fmtPct(pctVs50, 2), cls: pctClass(pctVs50) },
        { label: "vs 200d MA", value: fmtPct(pctVs200, 2), cls: pctClass(pctVs200) },
        { label: "RSI(14)", value: fmtNum(snap.rsi14, 1) },
        { label: "3-mo return", value: fmtPct(snap.perf3m, 2), cls: pctClass(snap.perf3m) },
        { label: "1-yr return", value: fmtPct(snap.perf1y, 2), cls: pctClass(snap.perf1y) },
        { label: "From 52w high", value: fmtPct(snap.pctFromHigh, 2), cls: pctClass(snap.pctFromHigh) },
      ],
    },
    {
      title: "Analyst",
      rows: [
        { label: "# analysts", value: fmtNum(snap.numberOfAnalysts, 0) },
        { label: "Mean target", value: fmtMoney(snap.targetMeanPrice) },
        { label: "High target", value: fmtMoney(snap.targetHighPrice) },
        { label: "Low target", value: fmtMoney(snap.targetLowPrice) },
        { label: "Upside to mean", value: fmtPct(upside, 1), cls: pctClass(upside) },
        { label: "Recommendation", value: fmtNum(snap.recommendationMean, 2) },
      ],
    },
  ];
}

export default function MetricsTable({ snap }: { snap: Snapshot }) {
  const panels = build(snap);
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {panels.map((p, i) => (
        <div key={p.title} className="rounded-md border border-border bg-panel p-4">
          <div className="text-muted text-xs uppercase tracking-wider mb-2 flex items-baseline justify-between">
            <span>{p.title}</span>
            <span className="text-dim font-mono text-[10px]">
              {String(i + 1).padStart(2, "0")}/08
            </span>
          </div>
          <dl className="space-y-1">
            {p.rows.map((r) => (
              <div key={r.label} className="flex items-baseline justify-between gap-2 text-sm">
                <dt className="text-muted truncate">{r.label}</dt>
                <dd className={`font-mono text-right ${r.cls ?? "text-ink"}`}>{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </section>
  );
}
