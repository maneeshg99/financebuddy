"use client";

import { useEffect, useMemo, useState } from "react";
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

type ThemeName = "bbg-v1" | "bbg-v2";

function useTheme(): ThemeName {
  const [theme, setTheme] = useState<ThemeName>("bbg-v1");
  useEffect(() => {
    const read = () => {
      const cl = document.documentElement.classList;
      setTheme(cl.contains("theme-bbg-v2") ? "bbg-v2" : "bbg-v1");
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return theme;
}

const CHART_COLORS: Record<ThemeName, {
  price: string; ma50: string; ma200: string;
  grid: string; axis: string;
  tip: string; tipBorder: string; tipInk: string; tipLabel: string;
}> = {
  "bbg-v1": { price: "#ffd500", ma50: "#00d4ff", ma200: "#ff6600", grid: "#1f1f1f", axis: "#7a7a7a", tip: "#050505", tipBorder: "#ff6600", tipInk: "#ffd500", tipLabel: "#ff6600" },
  "bbg-v2": { price: "#ffd500", ma50: "#00d4ff", ma200: "#ff4dc4", grid: "#1a1a1a", axis: "#6a6a6a", tip: "#000000", tipBorder: "#ff6600", tipInk: "#ffd500", tipLabel: "#00d4ff" },
};

export default function PriceChart({ symbol }: { symbol: string }) {
  const [range, setRange] = useState<Range>("1Y");
  const [data, setData] = useState<ChartPoint[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const theme = useTheme();
  const brutal = true; // all themes use hard-edged tooltip / density
  const colors = CHART_COLORS[theme];

  useEffect(() => {
    let alive = true;
    setErr(null);
    setData(null);
    fetch(`/api/chart/${encodeURIComponent(symbol)}?range=${range}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => {
        if (!alive) return;
        if (Array.isArray(j)) setData(j as ChartPoint[]);
        else setErr("Unexpected response");
      })
      .catch((e) => {
        if (!alive) return;
        setErr(String(e?.message ?? e));
      });
    return () => {
      alive = false;
    };
  }, [symbol, range]);

  const fmt = useMemo(() => {
    return (t: string) => {
      const d = new Date(t);
      if (range === "5Y") return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
      if (range === "1Y") return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    };
  }, [range]);

  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="text-muted text-xs uppercase tracking-wider">PX HISTORY /// CH-01</div>
        </div>
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
              <CartesianGrid stroke={colors.grid} strokeDasharray={brutal ? "1 3" : "2 4"} vertical={false} />
              <XAxis
                dataKey="t"
                tickFormatter={fmt}
                stroke={colors.axis}
                tick={{ fontSize: 11 }}
                minTickGap={40}
              />
              <YAxis
                domain={["auto", "auto"]}
                stroke={colors.axis}
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => v.toFixed(0)}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  background: colors.tip,
                  border: `1px solid ${colors.tipBorder}`,
                  borderRadius: brutal ? 0 : 6,
                  color: colors.tipInk,
                  fontSize: 12,
                }}
                labelStyle={{ color: colors.tipLabel }}
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
                stroke={colors.price}
                strokeWidth={brutal ? 1.5 : 2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="ma50"
                name="50d MA"
                stroke={colors.ma50}
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
                stroke={colors.ma200}
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
          <span className="inline-block w-3 h-0.5" style={{ background: colors.price }} /> Close
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5" style={{ background: colors.ma50 }} /> 50d MA
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5" style={{ background: colors.ma200 }} /> 200d MA
        </span>
      </div>
    </section>
  );
}
