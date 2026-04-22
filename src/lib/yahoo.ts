import YahooFinance from "yahoo-finance2";
import type { ChartPoint, Snapshot } from "./types";
import { safeNum } from "./format";

const yahooFinance = new YahooFinance();

// quiet the dev console
try {
  (yahooFinance as unknown as { suppressNotices?: (n: string[]) => void }).suppressNotices?.([
    "yahooSurvey",
    "ripHistorical",
  ]);
} catch {
  // older wrapper versions may not expose this — ignore
}

// Normalize BRK.B → BRK-B (yahoo uses dashes for share classes)
export function normalizeSymbol(s: string): string {
  return s.trim().toUpperCase().replace(/\./g, "-");
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function quoteSummarySafe(symbol: string) {
  const attempt = async (full: boolean) => {
    const modules = full
      ? ([
          "price",
          "summaryDetail",
          "defaultKeyStatistics",
          "financialData",
          "summaryProfile",
          "assetProfile",
          "calendarEvents",
          "earnings",
          "earningsHistory",
          "earningsTrend",
          "recommendationTrend",
          "incomeStatementHistory",
          "cashflowStatementHistory",
        ] as const)
      : ([
          "price",
          "summaryDetail",
          "defaultKeyStatistics",
          "financialData",
          "summaryProfile",
          "calendarEvents",
        ] as const);
    return yahooFinance.quoteSummary(symbol, { modules: modules as unknown as (typeof modules)[number][] });
  };

  // Try full → safe → safe with one retry on transient failure
  try {
    return await attempt(true);
  } catch {
    // fall through
  }
  try {
    return await attempt(false);
  } catch (err) {
    await sleep(700);
    return await attempt(false).catch((e) => {
      throw e ?? err;
    });
  }
}

// Raw (typeof Yahoo value may be number or { raw: number })
function r(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "object" && v !== null && "raw" in (v as Record<string, unknown>)) {
    const raw = (v as { raw: unknown }).raw;
    return typeof raw === "number" && Number.isFinite(raw) ? raw : null;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function percentify(v: number | null): number | null {
  // yahoo sometimes returns 0.12 (12%) and sometimes 12.0. Heuristic: if |v| > 3, assume it's already %; divide by 100.
  if (v === null) return null;
  if (Math.abs(v) > 3) return v / 100;
  return v;
}

type Bar = { date: Date; close: number };

function computeRSI(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function perfOffset(closes: number[], offsetDays: number): number | null {
  if (closes.length <= offsetDays) return null;
  const last = closes[closes.length - 1];
  const past = closes[closes.length - 1 - offsetDays];
  if (!Number.isFinite(last) || !Number.isFinite(past) || past === 0) return null;
  return (last - past) / past;
}

function cagr(startVal: number, endVal: number, years: number): number | null {
  if (!Number.isFinite(startVal) || !Number.isFinite(endVal) || startVal <= 0 || endVal <= 0 || years <= 0) return null;
  return Math.pow(endVal / startVal, 1 / years) - 1;
}

export async function fetchSnapshot(symbolRaw: string): Promise<Snapshot> {
  const symbol = normalizeSymbol(symbolRaw);
  const qs = (await quoteSummarySafe(symbol)) as any;

  const price = qs?.price ?? {};
  const sum = qs?.summaryDetail ?? {};
  const stats = qs?.defaultKeyStatistics ?? {};
  const fin = qs?.financialData ?? {};
  const prof = (qs?.summaryProfile ?? qs?.assetProfile ?? {}) as Record<string, unknown>;
  const cal = qs?.calendarEvents ?? {};
  const incHist = qs?.incomeStatementHistory ?? {};
  const cfHist = qs?.cashflowStatementHistory ?? {};
  const earnHist = qs?.earningsHistory ?? {};

  const regPrice = r((price as any).regularMarketPrice) ?? r((fin as any).currentPrice);
  const prevClose = r((price as any).regularMarketPreviousClose) ?? r((sum as any).previousClose);
  const change = r((price as any).regularMarketChange);
  const changePct = r((price as any).regularMarketChangePercent);

  // Derive revenue CAGR 3y from income statement history if available
  let revenueCagr3y: number | null = null;
  try {
    const rows = (incHist as any).incomeStatementHistory;
    if (Array.isArray(rows) && rows.length >= 4) {
      const latest = r(rows[0]?.totalRevenue);
      const three = r(rows[3]?.totalRevenue);
      if (latest && three) revenueCagr3y = cagr(three, latest, 3);
    }
  } catch {
    // ignore
  }

  // EPS 5y CAGR from earnings history (4 quarters/year => 20 quarters for 5y)
  let epsCagr5y: number | null = null;
  try {
    const rows = (earnHist as any).history;
    if (Array.isArray(rows) && rows.length >= 20) {
      const recent = r(rows[rows.length - 1]?.epsActual);
      const old = r(rows[rows.length - 20]?.epsActual);
      if (recent && old) epsCagr5y = cagr(old, recent, 5);
    }
  } catch {
    // ignore
  }

  // Free cash flow: prefer financialData.freeCashflow; derive from CF statement if missing
  let freeCashflow = r((fin as any).freeCashflow);
  if (freeCashflow === null) {
    try {
      const rows = (cfHist as any).cashflowStatements;
      const row = Array.isArray(rows) ? rows[0] : null;
      const op = r(row?.totalCashFromOperatingActivities);
      const capex = r(row?.capitalExpenditures);
      if (op !== null && capex !== null) freeCashflow = op + capex; // capex is negative
    } catch {
      // ignore
    }
  }

  const totalRevenue = r((fin as any).totalRevenue);
  const fcfMargin = freeCashflow !== null && totalRevenue && totalRevenue > 0 ? freeCashflow / totalRevenue : null;

  // Next earnings date
  let nextEarningsDate: string | null = null;
  try {
    const ed = (cal as any).earnings?.earningsDate;
    const d = Array.isArray(ed) ? ed[0] : ed;
    if (d instanceof Date) nextEarningsDate = d.toISOString();
    else if (typeof d === "string") nextEarningsDate = new Date(d).toISOString();
    else if (d && typeof d === "object" && "raw" in d) {
      const raw = (d as { raw: number }).raw;
      nextEarningsDate = new Date(raw * 1000).toISOString();
    }
  } catch {
    // ignore
  }

  // Chart-derived momentum: fetch a ~14 month history for the snapshot
  let rsi14: number | null = null;
  let pctFromHigh: number | null = null;
  let pctFromLow: number | null = null;
  let perf1m: number | null = null;
  let perf3m: number | null = null;
  let perf6m: number | null = null;
  let perf1y: number | null = null;

  const fetchHist = async () =>
    yahooFinance.chart(symbol, {
      period1: new Date(Date.now() - 420 * 24 * 3600 * 1000),
      interval: "1d",
    });

  try {
    let hist: any;
    try {
      hist = await fetchHist();
    } catch {
      await sleep(600);
      hist = await fetchHist();
    }
    const bars = ((hist?.quotes ?? []) as Array<{ date: Date; close: number | null }>)
      .map((q) => ({ date: q.date, close: q.close as number }))
      .filter((b): b is Bar => !!b.date && typeof b.close === "number" && Number.isFinite(b.close));
    const closes = bars.map((b) => b.close);
    if (closes.length) {
      rsi14 = computeRSI(closes, 14);
      perf1m = perfOffset(closes, 21);
      perf3m = perfOffset(closes, 63);
      perf6m = perfOffset(closes, 126);
      perf1y = perfOffset(closes, 252);

      const window1y = closes.slice(-252);
      const highW = Math.max(...window1y);
      const lowW = Math.min(...window1y);
      const last = closes[closes.length - 1];
      if (highW > 0) pctFromHigh = (last - highW) / highW;
      if (lowW > 0) pctFromLow = (last - lowW) / lowW;
    }
  } catch {
    // chart fetch may fail on illiquid tickers — leave momentum fields null
  }

  // Debt/equity: normalize if yahoo returns it as 120 meaning 1.2x
  let debtToEquity = r((fin as any).debtToEquity);
  if (debtToEquity !== null && debtToEquity > 5) debtToEquity = debtToEquity / 100;

  const snapshot: Snapshot = {
    symbol,
    name: (price as any).longName ?? (price as any).shortName ?? null,
    exchange: (price as any).exchangeName ?? (price as any).exchange ?? null,
    sector: (prof.sector as string) ?? null,
    industry: (prof.industry as string) ?? null,
    currency: (price as any).currency ?? null,

    price: regPrice,
    change,
    changePct: changePct !== null ? percentify(changePct) : null,
    previousClose: prevClose,
    dayHigh: r((price as any).regularMarketDayHigh) ?? r((sum as any).dayHigh),
    dayLow: r((price as any).regularMarketDayLow) ?? r((sum as any).dayLow),
    volume: r((price as any).regularMarketVolume),
    avgVolume: r((price as any).averageDailyVolume3Month) ?? r((sum as any).averageVolume),
    marketCap: r((price as any).marketCap) ?? r((sum as any).marketCap),

    fiftyTwoWeekHigh: r((sum as any).fiftyTwoWeekHigh),
    fiftyTwoWeekLow: r((sum as any).fiftyTwoWeekLow),
    fiftyDayAverage: r((sum as any).fiftyDayAverage),
    twoHundredDayAverage: r((sum as any).twoHundredDayAverage),

    trailingPE: r((sum as any).trailingPE) ?? r((stats as any).trailingPE),
    forwardPE: r((sum as any).forwardPE) ?? r((stats as any).forwardPE),
    pegRatio: r((stats as any).pegRatio),
    priceToBook: r((stats as any).priceToBook),
    priceToSales: r((sum as any).priceToSalesTrailing12Months),
    evToEbitda: r((stats as any).enterpriseToEbitda),
    enterpriseValue: r((stats as any).enterpriseValue),

    trailingEps: r((stats as any).trailingEps),
    forwardEps: r((stats as any).forwardEps),
    bookValuePerShare: r((stats as any).bookValue),
    sharesOutstanding: r((stats as any).sharesOutstanding) ?? r((price as any).sharesOutstanding),
    freeCashflow,
    operatingCashflow: r((fin as any).operatingCashflow),
    totalRevenue,
    ebitda: r((fin as any).ebitda),
    netIncome: r((stats as any).netIncomeToCommon),

    grossMargin: r((fin as any).grossMargins),
    operatingMargin: r((fin as any).operatingMargins),
    profitMargin: r((fin as any).profitMargins),
    fcfMargin,
    returnOnEquity: r((fin as any).returnOnEquity),
    returnOnAssets: r((fin as any).returnOnAssets),

    debtToEquity,
    currentRatio: r((fin as any).currentRatio),
    quickRatio: r((fin as any).quickRatio),
    totalCash: r((fin as any).totalCash),
    totalDebt: r((fin as any).totalDebt),

    revenueGrowth: r((fin as any).revenueGrowth),
    earningsGrowth: r((fin as any).earningsGrowth),
    revenueCagr3y,
    epsCagr5y,

    dividendYield: r((sum as any).dividendYield) ?? r((sum as any).trailingAnnualDividendYield),
    payoutRatio: r((sum as any).payoutRatio),

    targetMeanPrice: r((fin as any).targetMeanPrice),
    targetHighPrice: r((fin as any).targetHighPrice),
    targetLowPrice: r((fin as any).targetLowPrice),
    numberOfAnalysts: r((fin as any).numberOfAnalystOpinions),
    recommendationMean: r((fin as any).recommendationMean),

    rsi14,
    pctFromHigh,
    pctFromLow,
    perf1m,
    perf3m,
    perf6m,
    perf1y,

    nextEarningsDate,
  };

  // Final tidy: a few values might still need coercion
  snapshot.change = safeNum(snapshot.change);
  snapshot.changePct = safeNum(snapshot.changePct);
  return snapshot;
}

type Range = "1M" | "3M" | "1Y" | "5Y";

function rangeDays(range: Range): number {
  switch (range) {
    case "1M":
      return 31;
    case "3M":
      return 93;
    case "1Y":
      return 366;
    case "5Y":
      return 366 * 5;
  }
}

export async function fetchChart(symbolRaw: string, range: Range = "1Y"): Promise<ChartPoint[]> {
  const symbol = normalizeSymbol(symbolRaw);
  const visibleDays = rangeDays(range);
  // pull 250 extra trading days (~365 cal days) before the visible window so MAs are populated from day 1
  const extraCal = 365;
  const totalDays = visibleDays + extraCal;
  const period1 = new Date(Date.now() - totalDays * 24 * 3600 * 1000);
  const interval = range === "5Y" ? "1wk" : "1d";

  const result = (await yahooFinance.chart(symbol, { period1, interval })) as any;
  const bars: Bar[] = ((result?.quotes ?? []) as Array<{ date: Date; close: number | null }>)
    .map((q) => ({ date: q.date, close: q.close as number }))
    .filter((b): b is Bar => !!b.date && typeof b.close === "number" && Number.isFinite(b.close));

  // Compute MAs over whole series
  const out: ChartPoint[] = [];
  const closes = bars.map((b) => b.close);
  for (let i = 0; i < bars.length; i++) {
    const ma50 =
      i >= 49
        ? closes.slice(i - 49, i + 1).reduce((a, b) => a + b, 0) / 50
        : null;
    const ma200 =
      i >= 199
        ? closes.slice(i - 199, i + 1).reduce((a, b) => a + b, 0) / 200
        : null;
    out.push({
      t: bars[i].date.toISOString(),
      c: bars[i].close,
      ma50,
      ma200,
    });
  }

  const cutoff = Date.now() - visibleDays * 24 * 3600 * 1000;
  return out.filter((p) => new Date(p.t).getTime() >= cutoff);
}

export type { Range };
