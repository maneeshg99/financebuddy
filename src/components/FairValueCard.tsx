import type { FairValue } from "@/lib/types";
import { fmtMoney, fmtPct, pctClass } from "@/lib/format";

function VerdictPill({ v }: { v: FairValue["verdict"] }) {
  const styles: Record<FairValue["verdict"], string> = {
    Undervalued: "bg-up/15 text-up border-up/30",
    Fair: "bg-warn/15 text-warn border-warn/30",
    Overvalued: "bg-down/15 text-down border-down/30",
    "Insufficient data": "bg-panel2 text-muted border-border",
  };
  return (
    <span className={`fb-verdict inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${styles[v]}`}>
      {v}
    </span>
  );
}

export default function FairValueCard({
  fv,
  price,
}: {
  fv: FairValue;
  price: number | null;
}) {
  const { low, mid, high, verdict, upsidePct, estimates } = fv;

  const bandReady = low !== null && high !== null && low !== high;
  let markerPct = 0;
  if (bandReady && price !== null) {
    // Clamp to [-20, 120] so the marker doesn't fly off
    const pad = (high! - low!) * 0.2 || 1;
    const min = low! - pad;
    const max = high! + pad;
    markerPct = ((price - min) / (max - min)) * 100;
    if (!Number.isFinite(markerPct)) markerPct = 50;
    markerPct = Math.max(0, Math.min(100, markerPct));
  }

  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-muted text-xs uppercase tracking-wider">
            <span className="fb-brutal-only text-dim">[ </span>
            <span className="fb-default-only">Fair Value</span>
            <span className="fb-brutal-only">FAIR VALUE /// VAL-02</span>
            <span className="fb-brutal-only text-dim"> ]</span>
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <VerdictPill v={verdict} />
            {upsidePct !== null ? (
              <span className={`text-sm ${pctClass(upsidePct)}`}>
                {upsidePct >= 0 ? "+" : ""}
                {fmtPct(upsidePct, 1)} to mid
              </span>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <div className="text-dim text-xs">
            <span className="fb-default-only">Current price</span>
            <span className="fb-brutal-only">LAST /// PX</span>
          </div>
          <div className="font-mono text-xl text-ink">{fmtMoney(price)}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border border-border bg-panel2 p-3 text-center">
          <div className="text-xs text-muted uppercase tracking-wider">
            <span className="fb-brutal-only text-dim">&lt; </span>LOW<span className="fb-brutal-only text-dim"> &gt;</span>
          </div>
          <div className="font-mono text-lg text-ink">{fmtMoney(low)}</div>
        </div>
        <div className="rounded-md border border-accent/40 bg-panel2 p-3 text-center">
          <div className="text-xs text-accent uppercase tracking-wider">
            <span className="fb-brutal-only">&gt;&gt; </span>MID<span className="fb-brutal-only"> &lt;&lt;</span>
          </div>
          <div className="font-mono text-lg text-ink">{fmtMoney(mid)}</div>
        </div>
        <div className="rounded-md border border-border bg-panel2 p-3 text-center">
          <div className="text-xs text-muted uppercase tracking-wider">
            <span className="fb-brutal-only text-dim">&lt; </span>HIGH<span className="fb-brutal-only text-dim"> &gt;</span>
          </div>
          <div className="font-mono text-lg text-ink">{fmtMoney(high)}</div>
        </div>
      </div>

      {bandReady ? (
        <div className="mt-5">
          <div className="relative h-6">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-border" />
            <div className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-accent/50"
              style={{ left: "20%", right: "20%" }} />
            {price !== null ? (
              <div
                className="absolute top-0 h-6 w-0.5 bg-ink"
                style={{ left: `calc(${markerPct}% - 1px)` }}
                aria-label="Current price marker"
              />
            ) : null}
          </div>
          <div className="flex justify-between text-xs text-dim mt-1 font-mono">
            <span>{fmtMoney(low)}</span>
            <span>{fmtMoney(high)}</span>
          </div>
        </div>
      ) : null}

      <div className="mt-5 border-t border-border pt-4">
        <div className="text-xs uppercase tracking-wider text-muted mb-2">
          <span className="fb-brutal-only text-dim">[ </span>
          <span className="fb-default-only">Estimates</span>
          <span className="fb-brutal-only">METHODS /// N=5</span>
          <span className="fb-brutal-only text-dim"> ]</span>
        </div>
        <ul className="space-y-1 text-sm">
          {estimates.map((e) => (
            <li key={e.method} className="flex items-baseline justify-between gap-3">
              <div className="text-ink">
                {e.method}
                {e.note ? <span className="text-dim"> — {e.note}</span> : null}
              </div>
              <div className="font-mono text-ink whitespace-nowrap">
                {e.value !== null ? fmtMoney(e.value) : <span className="text-dim">—</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
