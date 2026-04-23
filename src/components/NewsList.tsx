import type { NewsItem } from "@/lib/types";
import { fmtDate } from "@/lib/format";

export default function NewsList({
  items,
  nextEarnings,
  hasKey,
}: {
  items: NewsItem[];
  nextEarnings: string | null;
  hasKey: boolean;
}) {
  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-muted text-xs uppercase tracking-wider">FEED /// CATALYSTS</div>
        <div className="text-sm text-muted">
          <span className="text-dim text-xs uppercase tracking-wider">NEXT-EPS </span>
          <span className="font-mono text-ink">{nextEarnings ? fmtDate(nextEarnings) : "—"}</span>
        </div>
      </div>

      {!hasKey ? (
        <div className="rounded-md border border-border bg-panel2 p-4 text-sm text-muted">
          Finnhub key not set. Grab a free one at{" "}
          <a
            className="text-accent underline decoration-accent/30 hover:decoration-accent"
            href="https://finnhub.io/register"
            target="_blank"
            rel="noopener noreferrer"
          >
            finnhub.io/register
          </a>{" "}
          and add <code className="font-mono text-ink">FINNHUB_API_KEY</code> to{" "}
          <code className="font-mono text-ink">.env.local</code> to enable news + next earnings.
        </div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted">No recent headlines.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id} className="rounded-md border border-border bg-panel2 hover:bg-panel2/80 transition">
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3"
              >
                <div className="text-ink text-sm leading-snug">{n.headline}</div>
                <div className="text-dim text-xs mt-1 font-mono">
                  {n.source} · {fmtDate(n.datetime)}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
