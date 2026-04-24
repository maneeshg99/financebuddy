import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Sources · FinanceBuddy",
  description: "Where FinanceBuddy data comes from.",
};

export default function DataSourcesPage() {
  return (
    <article className="rounded-md border border-border bg-panel p-6 max-w-3xl mx-auto">
      <div className="text-muted text-xs uppercase tracking-wider mb-4">SOURCES /// DOC-03</div>
      <h1 className="text-2xl text-ink mb-6">Data Sources</h1>

      <div className="space-y-5 text-sm text-muted leading-relaxed">
        <p>
          Every data point on this site is derived from one of the sources below. Model outputs
          (composite score, fair value) are documented on the methodology page (coming in Phase 1).
        </p>

        <section>
          <h2 className="text-ink text-base mb-2">Yahoo Finance</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Quote snapshots: price, change, market cap, currency</li>
            <li>Session stats: previous close, day range, volume, 52-week range</li>
            <li>Fundamentals: valuation, profitability, balance sheet, growth, per-share</li>
            <li>Analyst consensus: target price, rating, number of analysts</li>
            <li>Price history for chart, moving averages, momentum indicators</li>
          </ul>
          <p className="mt-2 text-dim text-xs">
            Accessed via the <code className="text-accent">yahoo-finance2</code> library. Data is
            cached for 5 minutes per symbol.
          </p>
        </section>

        <section>
          <h2 className="text-ink text-base mb-2">Finnhub</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Company news headlines</li>
            <li>Upcoming earnings dates</li>
          </ul>
          <p className="mt-2 text-dim text-xs">
            Accessed via Finnhub&rsquo;s REST API using a free-tier API key. News is cached for 30
            minutes; earnings for 6 hours.
          </p>
        </section>

        <section>
          <h2 className="text-ink text-base mb-2">Data limitations</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Prices can be delayed up to 15 minutes on US equities.</li>
            <li>Non-US tickers, illiquid symbols, and new listings may have sparse data.</li>
            <li>Composite score and fair value are models — they reflect assumptions, not truth.</li>
          </ul>
        </section>
      </div>
    </article>
  );
}
