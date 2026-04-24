import type { Snapshot } from "@/lib/types";
import { fmtMoney, fmtPct, fmtCompact, pctClass } from "@/lib/format";

function Cell({
  label,
  children,
  valueClass = "text-ink",
}: {
  label: string;
  children: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[9px] uppercase tracking-widest text-accent whitespace-nowrap">
        {label}
      </span>
      <span className={`font-mono text-xs ${valueClass} whitespace-nowrap truncate`}>
        {children}
      </span>
    </div>
  );
}

function volRatio(vol: number | null, avg: number | null): string {
  if (vol === null || avg === null || avg === 0) return "—";
  const r = vol / avg;
  return `${r.toFixed(2)}x`;
}

export default function SessionStats({ snap }: { snap: Snapshot }) {
  const volR =
    snap.volume !== null && snap.avgVolume !== null ? snap.volume / snap.avgVolume : null;
  const weekPos =
    snap.price !== null && snap.fiftyTwoWeekHigh !== null && snap.fiftyTwoWeekLow !== null
      ? ((snap.price - snap.fiftyTwoWeekLow) / (snap.fiftyTwoWeekHigh - snap.fiftyTwoWeekLow)) * 100
      : null;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-x-4 gap-y-2 px-5 py-3">
        <Cell label="Prev Close">{fmtMoney(snap.previousClose)}</Cell>
        <Cell label="Day Low" valueClass="text-down">
          {fmtMoney(snap.dayLow)}
        </Cell>
        <Cell label="Day High" valueClass="text-up">
          {fmtMoney(snap.dayHigh)}
        </Cell>
        <Cell label="Volume">{snap.volume !== null ? fmtCompact(snap.volume) : "—"}</Cell>
        <Cell
          label="Vol vs Avg"
          valueClass={volR === null ? "text-ink" : volR >= 1 ? "text-up" : "text-muted"}
        >
          {volRatio(snap.volume, snap.avgVolume)}
        </Cell>
        <Cell label="52W Low" valueClass="text-down">
          {fmtMoney(snap.fiftyTwoWeekLow)}
        </Cell>
        <Cell label="52W High" valueClass="text-up">
          {fmtMoney(snap.fiftyTwoWeekHigh)}
        </Cell>
        <Cell
          label="52W Pos"
          valueClass={weekPos === null ? "text-ink" : weekPos >= 50 ? "text-up" : "text-down"}
        >
          {weekPos !== null ? `${weekPos.toFixed(0)}%` : "—"}
        </Cell>
      </div>
      {weekPos !== null ? (
        <div className="relative h-1 bg-border">
          <div
            className="absolute top-0 h-full bg-accent"
            style={{ left: 0, width: `${Math.max(0, Math.min(100, weekPos))}%` }}
          />
        </div>
      ) : null}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 px-5 py-3 border-t border-border">
        <Cell label="1M" valueClass={pctClass(snap.perf1m)}>
          {fmtPct(snap.perf1m, 2)}
        </Cell>
        <Cell label="3M" valueClass={pctClass(snap.perf3m)}>
          {fmtPct(snap.perf3m, 2)}
        </Cell>
        <Cell label="6M" valueClass={pctClass(snap.perf6m)}>
          {fmtPct(snap.perf6m, 2)}
        </Cell>
        <Cell label="1Y" valueClass={pctClass(snap.perf1y)}>
          {fmtPct(snap.perf1y, 2)}
        </Cell>
      </div>
    </div>
  );
}
