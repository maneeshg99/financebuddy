import type { Metadata } from "next";
import Link from "next/link";
import { cache, Suspense } from "react";
import { unstable_cache } from "next/cache";
import ChartSection from "@/components/ChartSection";
import FairValueCard from "@/components/FairValueCard";
import MarginOfSafetyBadge from "@/components/MarginOfSafetyBadge";
import MetricsTable from "@/components/MetricsTable";
import NewsList from "@/components/NewsList";
import ScoreCard from "@/components/ScoreCard";
import TabNav, { parseTab } from "@/components/TabNav";
import WatchlistStar from "@/components/WatchlistStar";
import { fetchSnapshot, normalizeSymbol } from "@/lib/yahoo";
import { fetchNews, fetchNextEarnings, hasFinnhubKey } from "@/lib/finnhub";
import { buildScoreReport } from "@/lib/score";
import { buildFairValue } from "@/lib/fairvalue";
import { fmtMoney, fmtMoneyCompact, fmtPct, pctClass } from "@/lib/format";

// React.cache dedupes within a single request (generateMetadata + page call).
// unstable_cache dedupes across requests with a 5-min revalidate window.
const getSnapshot = cache((symbol: string) =>
  unstable_cache(
    async () => fetchSnapshot(symbol),
    ["fb-snapshot", symbol],
    { revalidate: 300, tags: [`fb-snapshot-${symbol}`] }
  )()
);

export async function generateMetadata({
  params,
}: {
  params: { ticker: string };
}): Promise<Metadata> {
  const raw = decodeURIComponent(params.ticker);
  const symbol = normalizeSymbol(raw);
  let name: string | null = null;
  try {
    const snap = await getSnapshot(symbol);
    name = snap.name;
  } catch {
    // fall through to symbol-only title
  }
  const title = name ? `${symbol} · ${name} · FinanceBuddy` : `${symbol} · FinanceBuddy`;
  const description = name
    ? `${name} — composite score, fair value band, metrics, and news on FinanceBuddy.`
    : `${symbol} composite score, fair value band, metrics, and news on FinanceBuddy.`;
  return { title, description };
}

function HeaderStrip({
  snap,
}: {
  snap: Awaited<ReturnType<typeof fetchSnapshot>>;
}) {
  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-dim mb-3 flex items-center justify-between">
        <span>{`/// TARGET ACQUIRED /// SYM = ${snap.symbol}`}</span>
        <span>{"CH-A ● LIVE"}</span>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-3xl text-ink">{snap.symbol}</span>
            <span className="text-dim text-xs uppercase tracking-wider">
              {snap.exchange ?? ""} {snap.currency ? `· ${snap.currency}` : ""}
            </span>
          </div>
          <div className="text-ink text-lg mt-1">{snap.name ?? snap.symbol}</div>
          <div className="text-muted text-xs mt-1">
            {[snap.sector, snap.industry].filter(Boolean).join(" · ") || "—"}
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="font-mono text-3xl text-ink">{fmtMoney(snap.price)}</div>
            <div className={`font-mono text-sm ${pctClass(snap.changePct)}`}>
              {snap.change !== null && snap.change >= 0 ? "+" : ""}
              {fmtMoney(snap.change)} ({fmtPct(snap.changePct, 2)})
            </div>
            <div className="text-dim text-xs mt-0.5">
              Mkt cap <span className="font-mono text-muted">{fmtMoneyCompact(snap.marketCap)}</span>
            </div>
          </div>
          <WatchlistStar symbol={snap.symbol} />
        </div>
      </div>
    </section>
  );
}

function NewsSkeleton() {
  return (
    <section className="rounded-md border border-border bg-panel p-5 animate-pulse">
      <div className="flex items-baseline justify-between mb-3">
        <div className="h-3 w-36 bg-border" />
        <div className="h-3 w-32 bg-border" />
      </div>
      <ul className="space-y-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <li key={i} className="rounded-md border border-border bg-panel2 p-3">
            <div className="h-3 w-4/5 bg-border mb-2" />
            <div className="h-3 w-1/3 bg-border" />
          </li>
        ))}
      </ul>
    </section>
  );
}

async function NewsPanel({
  symbol,
  fallbackEarnings,
}: {
  symbol: string;
  fallbackEarnings: string | null;
}) {
  const hasKey = hasFinnhubKey();
  type News = Awaited<ReturnType<typeof fetchNews>>;
  let news: News = [];
  let nextEarningsFinnhub: string | null = null;
  if (hasKey) {
    // finnhub.ts catches internally — this try/catch is belt-and-suspenders
    // so a rare uncaught reject degrades the news panel instead of taking
    // down the whole /[ticker] route via the error boundary.
    try {
      [news, nextEarningsFinnhub] = await Promise.all([
        fetchNews(symbol, 10),
        fetchNextEarnings(symbol),
      ]);
    } catch (err) {
      console.error(`[financebuddy] NewsPanel fetch failed for ${symbol}:`, err);
    }
  }
  const nextEarnings = nextEarningsFinnhub ?? fallbackEarnings;
  return <NewsList items={news} nextEarnings={nextEarnings} hasKey={hasKey} />;
}

export default async function TickerPage({
  params,
  searchParams,
}: {
  params: { ticker: string };
  searchParams?: { t?: string | string[] };
}) {
  const raw = decodeURIComponent(params.ticker);
  const symbol = normalizeSymbol(raw);
  const tab = parseTab(searchParams?.t);

  try {
    const snap = await getSnapshot(symbol);
    if (!snap.price && !snap.name) {
      throw new Error("empty snapshot");
    }
    const report = buildScoreReport(snap);
    const fv = buildFairValue(snap);

    return (
      <div className="space-y-4">
        <HeaderStrip snap={snap} />
        <ChartSection snap={snap} />
        <TabNav current={tab} symbol={snap.symbol} />
        {tab === "score" ? (
          <>
            <MarginOfSafetyBadge fv={fv} price={snap.price} />
            <ScoreCard report={report} />
          </>
        ) : null}
        {tab === "value" ? <FairValueCard fv={fv} price={snap.price} /> : null}
        {tab === "financials" ? <MetricsTable snap={snap} group="financials" /> : null}
        {tab === "analysis" ? <MetricsTable snap={snap} group="analysis" /> : null}
        {tab === "news" ? (
          <Suspense fallback={<NewsSkeleton />}>
            <NewsPanel symbol={snap.symbol} fallbackEarnings={snap.nextEarningsDate} />
          </Suspense>
        ) : null}
      </div>
    );
  } catch (err) {
    console.error(`[financebuddy] failed to load ${symbol}:`, err);
    return (
      <div className="rounded-md border border-border bg-panel p-8 text-center">
        <div className="text-muted text-sm mb-2">Couldn&apos;t load</div>
        <div className="font-mono text-2xl text-ink">{symbol}</div>
        <div className="text-muted text-sm mt-3">
          Is that a valid ticker? Try a US symbol like{" "}
          <Link href="/AAPL" className="text-accent underline decoration-accent/30 hover:decoration-accent">
            AAPL
          </Link>
          .
        </div>
      </div>
    );
  }
}
