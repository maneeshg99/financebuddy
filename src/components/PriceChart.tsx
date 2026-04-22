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

function useBrutal() {
  const [brutal, setBrutal] = useState(false);
  useEffect(() => {
    const read = () => setBrutal(document.documentElement.classList.contains("theme-brutal"));
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return brutal;
}

export default function PriceChart({ symbol }: { symbol: string }) {
  const [range, setRange] = useState<Range>("1Y");
  const [data, setData] = useState<ChartPoint[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const brutal = useBrutal();
  const colors = brutal
    ? { price: "#eaeaea", ma50: "#e6b919", ma200: "#e61919", grid: "#2a2a2a", axis: "#5c5c5c", tip: "#101010", tipBorder: "#2a2a2a", tipInk: "#eaeaea", tipLabel: "#9a9a9a" }
    : { price: "#7dd3fc", ma50: "#facc15", ma200: "#ef4444", grid: "#1f2937", axis: "#6b7280", tip: "#141c28", tipBorder: "#1f2937", tipInk: "#e5e7eb", tipLabel: "#9ca3af" };

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
          <div className="text-muted text-xs uppercase tracking-wider">
            <span className="fb-brutal-only text-dim">[ </span>
            <span className="fb-default-only">Price</span>
            <span className="fb-brutal-only">PX HISTORY /// CH-01</span>
            <span className="fb-brutal-only text-dim"> ]</span>
          </div>
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
