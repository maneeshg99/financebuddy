import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import Watchlist from "@/components/Watchlist";

const EXAMPLES = ["AAPL", "MSFT", "NVDA", "GOOGL", "BRK-B", "COST"];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-3xl md:text-5xl font-semibold text-ink">
          One ticker. <span className="text-accent">Full picture.</span>
        </h1>
        <p className="text-muted mt-3 max-w-xl mx-auto">
          Type a ticker. Get a snapshot, composite 0-100 score, fair value band, metrics, and catalysts — all on one page.
        </p>
        <div className="mt-6 max-w-xl mx-auto">
          <SearchBar />
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          {EXAMPLES.map((s) => (
            <Link
              key={s}
              href={`/${encodeURIComponent(s)}`}
              className="inline-block rounded-md border border-border bg-panel hover:border-accent hover:text-accent font-mono text-sm px-3 py-1.5 text-muted transition"
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      <Watchlist />
    </div>
  );
}
