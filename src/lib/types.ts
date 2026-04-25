export type Snapshot = {
  symbol: string;
  name: string | null;
  exchange: string | null;
  sector: string | null;
  industry: string | null;
  currency: string | null;

  price: number | null;
  change: number | null;
  changePct: number | null;
  previousClose: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  avgVolume: number | null;
  marketCap: number | null;

  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  fiftyDayAverage: number | null;
  twoHundredDayAverage: number | null;

  // valuation
  trailingPE: number | null;
  forwardPE: number | null;
  pegRatio: number | null;
  priceToBook: number | null;
  priceToSales: number | null;
  evToEbitda: number | null;
  enterpriseValue: number | null;

  // per-share / fundamentals
  trailingEps: number | null;
  forwardEps: number | null;
  bookValuePerShare: number | null;
  sharesOutstanding: number | null;
  freeCashflow: number | null;
  operatingCashflow: number | null;
  totalRevenue: number | null;
  ebitda: number | null;
  netIncome: number | null;

  // profitability / quality
  grossMargin: number | null;
  operatingMargin: number | null;
  profitMargin: number | null;
  fcfMargin: number | null;
  returnOnEquity: number | null;
  returnOnAssets: number | null;

  // balance sheet
  debtToEquity: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  totalCash: number | null;
  totalDebt: number | null;

  // growth
  revenueGrowth: number | null; // YoY
  earningsGrowth: number | null; // YoY
  revenueCagr3y: number | null;
  epsCagr5y: number | null;

  // yield / dividend
  dividendYield: number | null;
  payoutRatio: number | null;

  // analyst
  targetMeanPrice: number | null;
  targetHighPrice: number | null;
  targetLowPrice: number | null;
  numberOfAnalysts: number | null;
  recommendationMean: number | null;

  // momentum (derived from chart history)
  rsi14: number | null;
  pctFromHigh: number | null;
  pctFromLow: number | null;
  perf1m: number | null;
  perf3m: number | null;
  perf6m: number | null;
  perf1y: number | null;

  // events
  nextEarningsDate: string | null; // ISO
};

export type ChartPoint = {
  t: string; // ISO date
  c: number; // close
  ma50: number | null;
  ma200: number | null;
};

export type NewsItem = {
  id: string;
  headline: string;
  source: string;
  url: string;
  datetime: string; // ISO
  summary?: string;
};

export type Driver = {
  label: string;
  value: number | null;
  score: number | null; // 0-100 or null if input missing
  note?: string;
};

export type SubScore = {
  pillar: "Value" | "Growth" | "Momentum" | "Quality";
  score: number | null; // 0-100 or null if no drivers computable
  weight: number; // 0-1, relative in composite
  drivers: Driver[];
};

export type ScoreReport = {
  composite: number | null;
  thesis: string;
  subscores: SubScore[];
};

export type FairValueEstimate = {
  method: string;
  value: number | null; // price; null for informational (e.g., reverse DCF growth)
  note?: string;
  /**
   * True when this method's `value` was excluded from the band roll-up because
   * it sat more than 2 robust-σ from the median of the other estimates.
   * The estimate is still rendered in the list with a tag.
   */
  excluded?: boolean;
};

export type FairValueVerdict = "Undervalued" | "Fair" | "Overvalued" | "Insufficient data";

export type FairValue = {
  low: number | null;
  mid: number | null;
  high: number | null;
  verdict: FairValueVerdict;
  upsidePct: number | null;
  estimates: FairValueEstimate[];
};
