"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/types";

type Range = "1M" | "3M" | "1Y" | "5Y";
const RANGES: Range[] = ["1M", "3M", "1Y", "5Y"];

function rangeToApproxDays(r: Range): number {
  switch (r) {
    case "1M":
      return 30;
    case "3M":
      return 90;
    case "1Y":
      return 365;
    case "5Y":
      return 365 * 5;
  }
}

const COLORS = {
  price: "#ffd500",
  ma50: "#00d4ff",
  ma200: "#ff6600",
  grid: "#1f1f1f",
  axis: "#7a7a7a",
  tip: "#050505",
  tipBorder: "#ff6600",
  tipInk: "#ffd500",
  tipLabel: "#ff6600",
};

const fetcher = async (url: string): Promise<ChartPoint[]> => {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  if (!Array.isArray(j)) throw new Error("Unexpected response");
  return j as ChartPoint[];
};

export default function PriceChart({
  symbol,
  noFrame = false,
}: {
  symbol: string;
  noFrame?: boolean;
}) {
  const [range, setRange] = useState<Range>("1Y");

  const { data, error } = useSWR<ChartPoint[]>(
    `/api/chart/${encodeURIComponent(symbol)}?range=${range}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
      keepPreviousData: true,
    }
  );

  const err = error ? String((error as Error).message ?? error) : null;

  // Derive the tick formatter from the span of the rendered data, not from
  // the selected range. With keepPreviousData the data may belong to the
  // PREVIOUS range for a beat after a range switch — formatting by range
  // would mislabel those ticks until the refetch completes.
  const fmt = useMemo(() => {
    const spanDays =
      data && data.length >= 2
        ? (new Date(data[data.length - 1].t).getTime() -
            new Date(data[0].t).getTime()) /
          86_400_000
        : rangeToApproxDays(range);
    return (t: string) => {
      const d = new Date(t);
      if (spanDays > 400) return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
      if (spanDays > 120) return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    };
  }, [data, range]);

  const body = (
    <>
      <div className="flex items-baseline justify-between mb-3">
        {noFrame ? (
          <div />
        ) : (
          <div className="text-muted text-xs uppercase tracking-wider">PX HISTORY /// CH-01</div>
        )}
        <div className="flex items-center gap-1 text-sm">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-md font-mono text-xs transition border ${
                r === range
                  ? "bg-accent text-bg border-accent"
                  : "border-border text-muted hover:text-ink hover:border-accent/40"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: "100%", height: 340 }}>
        {err ? (
          <div className="flex items-center justify-center h-full text-down text-sm">
            Couldn&apos;t load chart: {err}
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center h-full text-muted text-sm">Loading…</div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted text-sm">No data</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={COLORS.grid} strokeDasharray="1 3" vertical={false} />
              <XAxis
                dataKey="t"
                tickFormatter={fmt}
                stroke={COLORS.axis}
                tick={{ fontSize: 11 }}
                minTickGap={40}
              />
              <YAxis
                domain={["auto", "auto"]}
                stroke={COLORS.axis}
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => v.toFixed(0)}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  background: COLORS.tip,
                  border: `1px solid ${COLORS.tipBorder}`,
                  borderRadius: 0,
                  color: COLORS.tipInk,
                  fontSize: 12,
                }}
                labelStyle={{ color: COLORS.tipLabel }}
                labelFormatter={(t: string) => new Date(t).toLocaleDateString()}
                formatter={(value: number | string, name: string) => {
                  if (value === null || value === undefined) return ["—", name];
                  const n = Number(value);
                  return [Number.isFinite(n) ? `$${n.toFixed(2)}` : "—", name];
                }}
              />
              <Line
                type="monotone"
                dataKey="c"
                name="Price"
                stroke={COLORS.price}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="ma50"
                name="50d MA"
                stroke={COLORS.ma50}
                strokeWidth={1.2}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="ma200"
                name="200d MA"
                stroke={COLORS.ma200}
                strokeWidth={1.2}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center gap-4 mt-2 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5" style={{ background: COLORS.price }} /> Close
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5" style={{ background: COLORS.ma50 }} /> 50d MA
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5" style={{ background: COLORS.ma200 }} /> 200d MA
        </span>
      </div>
    </>
  );

  if (noFrame) return <>{body}</>;
  return <section className="rounded-md border border-border bg-panel p-5">{body}</section>;
}
