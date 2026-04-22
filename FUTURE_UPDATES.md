# FinanceBuddy — Roadmap

A living list of planned integrations and improvements. Each item has a rough size (S/M/L) and notes on why it matters.

## v1.1 — fill the gaps in the current single-ticker view

- **(M) Full balance sheet view.** Today the page surfaces ratios; this would add a clean balance sheet panel: cash, total debt, working capital, goodwill, share count trend. Source: yahoo-finance2 `quoteSummary` modules `balanceSheetHistory` + `balanceSheetHistoryQuarterly`.
- **(M) Cash flow statement panel.** Operating / investing / financing CF with a 5-year stacked bar. Source: `cashflowStatementHistory`.
- **(S) Insider + institutional ownership.** % insider ownership, recent insider transactions, institutional ownership %, short interest. yahoo-finance2 covers most of this in `insiderHolders`, `institutionOwnership`, `defaultKeyStatistics`.
- **(S) Dividend history panel.** Date / amount / yield over time, payout ratio trend.
- **(S) Analyst consensus.** Mean target price, # of buys / holds / sells, EPS revisions trend. Source: `recommendationTrend`, `financialData`.

## v1.2 — 10-K / filings intelligence (the user explicitly flagged this)

- **(L) 10-K + 10-Q parsing.** Pull the latest filing from SEC EDGAR (free, no key). Surface: risk factors section, MD&A section, segment revenue breakdown, year-over-year language deltas. Storage in Supabase to avoid re-parsing.
- **(L) Filing diff.** Compare the latest 10-K's risk factors against the prior year's — flag added or substantially reworded risks. This is genuinely high signal and not on Yahoo / Bloomberg.
- **(M) 8-K stream.** Material event filings with one-line summaries (no LLM — use deterministic item-code mapping).
- **(M) Conference call transcripts.** Link to most recent earnings call transcript (Seeking Alpha or Motley Fool free pages); extract management guidance language.

## v1.3 — comparison + screening

- **(M) Auto peer set.** Pull industry / sector from yahoo-finance2 → fetch the top 5 peers by market cap → side-by-side ratio table on the ticker page.
- **(M) Manual multi-ticker compare page.** `/compare?tickers=AAPL,MSFT,GOOGL` — side-by-side scorecards.
- **(L) Screener.** "Show me sub-15 fwd P/E with >15% revenue growth and positive FCF." Requires a nightly cron + cached universe (a few thousand tickers in Supabase).

## v1.4 — fair value depth

- **(M) Sensitivity grid.** DCF output as a 2D heatmap: discount rate × terminal growth → implied price. Helps the user see how fragile the fair value is.
- **(M) Multiple-model overlay on price chart.** Plot DCF fair value, Graham, and analyst target as horizontal bands across the price chart.
- **(S) Custom assumption panel.** Let the user override growth rate, discount rate, terminal growth — see the fair value re-compute live.
- **(M) EPS-based valuation history.** Show current fwd P/E vs the company's own 5-year average — more honest than peer-average P/E for unique companies.

## v1.5 — buy-side workflow features

- **(M) Notes per ticker.** Free-text notes saved per ticker (localStorage v1, Supabase v2). My thesis, my entry price, my conviction level.
- **(M) Price alerts.** Push when price crosses fair value low / high band. Needs a cron + email or web push.
- **(L) Portfolio view.** Upload positions (CSV) → aggregate score, sector exposure, weighted avg P/E, contribution to risk.
- **(M) Macro overlay.** Show 10-year yield, DXY, VIX side bar — ties into the Macrostack thesis work.

## v2 — auth + monetization (only if v1 gets used)

- **(L) Sign-in via Google.** Supabase Auth.
- **(L) Sync watchlist + notes across devices.** Supabase Postgres.
- **(M) Paid tier.** Free: 5 tickers/day, no notes export. Paid ($9/mo or $79/yr): unlimited, notes export, alerts, peer comparison.
- **(S) Stripe checkout.** Standard Stripe + Supabase webhook setup.

## Infra / quality

- **(S) Add Vitest + a handful of unit tests** for `score.ts` and `fairvalue.ts` — these are the two files where a bug silently produces wrong numbers.
- **(S) Add `unstable_cache` to all data fetches** with sensible TTLs (prices 5 min, fundamentals 24h).
- **(M) Move from yahoo-finance2 to a paid feed** (Polygon Stocks Starter is $29/mo) once revenue justifies it. yahoo-finance2 will eventually break — the unofficial wrapper is fragile.
- **(S) Sentry for error tracking** once deployed publicly.
- **(M) E2E test for the ticker page** with Playwright — hit `/AAPL`, assert the score renders.

## Things explicitly NOT planned

- LLM-based news sentiment or filing summarization — paid AI inference is off the table until revenue exists.
- Crypto, options, futures — too much surface area for a personal-investor tool.
- Real-time streaming prices (websockets) — overkill for the buy-side use case here.
- Programmatic-SEO directory pages for every ticker — would chew through too many hours and Yahoo's free tier has no SEO upside.
