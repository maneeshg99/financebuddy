import Link from "next/link";
import { unstable_cache } from "next/cache";
import FairValueCard from "@/components/FairValueCard";
import MetricsTable from "@/components/MetricsTable";
import NewsList from "@/components/NewsList";
import PriceChart from "@/components/PriceChart";
import ScoreCard from "@/components/ScoreCard";
import WatchlistStar from "@/components/WatchlistStar";
import { fetchSnapshot, normalizeSymbol } from "@/lib/yahoo";
import { fetchNews, fetchNextEarnings, hasFinnhubKey } from "@/lib/finnhub";
import { buildScoreReport } from "@/lib/score";
import { buildFairValue } from "@/lib/fairvalue";
import { fmtMoney, fmtMoneyCompact, fmtPct, pctClass } from "@/lib/format";

const getSnapshot = (symbol: string) =>
  unstable_cache(
    async () => fetchSnapshot(symbol),
    ["fb-snapshot", symbol],
    { revalidate: 300, tags: [`fb-snapshot-${symbol}`] }
  )();

function HeaderStrip({
  snap,
}: {
  snap: Awaited<ReturnType<typeof fetchSnapshot>>;
}) {
  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <div className="fb-brutal-only font-mono text-[10px] uppercase tracking-[0.25em] text-dim mb-3 flex items-center justify-between">
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

export default async function TickerPage({ params }: { params: { ticker: string } }) {
  const raw = decodeURIComponent(params.ticker);
  const symbol = normalizeSymbol(raw);

  try {
    const snap = await getSnapshot(symbol);
    if (!snap.price && !snap.name) {
      throw new Error("empty snapshot");
    }
    const report = buildScoreReport(snap);
    const fv = buildFairValue(snap);

    const hasKey = hasFinnhubKey();
    const [news, nextEarningsFinnhub] = hasKey
      ? await Promise.all([fetchNews(symbol, 10), fetchNextEarnings(symbol)])
      : [[], null];
    const nextEarnings = nextEarningsFinnhub ?? snap.nextEarningsDate;

    return (
      <div className="space-y-5">
        <HeaderStrip snap={snap} />
        <ScoreCard report={report} />
        <FairValueCard fv={fv} price={snap.price} />
        <PriceChart symbol={snap.symbol} />
        <MetricsTable snap={snap} />
        <NewsList items={news} nextEarnings={nextEarnings} hasKey={hasKey} />
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
