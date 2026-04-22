import type { ScoreReport, SubScore } from "@/lib/types";
import { scoreBg, scoreClass } from "@/lib/format";

function SubCard({ sub }: { sub: SubScore }) {
  const s = sub.score;
  return (
    <div className="rounded-md border border-border bg-panel2 p-4">
      <div className="flex items-baseline justify-between">
        <div className="text-muted text-xs uppercase tracking-wider">
          <span className="fb-brutal-only text-dim">[ </span>
          {sub.pillar}
          <span className="fb-brutal-only text-dim"> ]</span>
        </div>
        <div className="text-dim text-xs">
          <span className="fb-brutal-only">W=</span>
          <span className="fb-default-only">weight </span>
          {(sub.weight * 100).toFixed(0)}%
        </div>
      </div>
      <div className={`font-mono text-3xl mt-1 ${scoreClass(s)}`}>{s ?? "—"}<span className="text-dim text-base">/100</span></div>
      <div className="w-full h-1.5 bg-border fb-score-bar rounded-full mt-2 overflow-hidden">
        <div
          className={`h-full ${scoreBg(s)}`}
          style={{ width: s !== null ? `${Math.max(0, Math.min(100, s))}%` : "0%" }}
        />
      </div>
      <ul className="mt-3 space-y-1 text-xs">
        {sub.drivers.map((d) => (
          <li key={d.label} className="flex items-baseline justify-between gap-2">
            <span className="text-muted truncate">
              {d.label}
              {d.note ? <span className="text-dim"> · {d.note}</span> : null}
            </span>
            <span className="font-mono text-ink whitespace-nowrap">
              {d.score === null ? (
                <span className="text-dim">—</span>
              ) : (
                <span className={scoreClass(d.score)}>{d.score}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ScoreCard({ report }: { report: ScoreReport }) {
  const c = report.composite;
  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-muted text-xs uppercase tracking-wider">
            <span className="fb-brutal-only text-dim">[ </span>
            <span className="fb-default-only">FinanceBuddy Score</span>
            <span className="fb-brutal-only">COMPOSITE SCORE /// FB-01</span>
            <span className="fb-brutal-only text-dim"> ]</span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <div className={`font-mono text-5xl font-semibold ${scoreClass(c)}`}>
              {c ?? "—"}
            </div>
            <div className="text-dim text-sm">/100</div>
          </div>
        </div>
        <p className="text-ink text-sm max-w-2xl md:text-right">{report.thesis}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        {report.subscores.map((s) => (
          <SubCard key={s.pillar} sub={s} />
        ))}
      </div>
    </section>
  );
}
