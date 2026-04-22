# FinanceBuddy — Build Prompt for Claude Code

Paste this entire file into Claude Code (or open it from this directory and say "build what's described in PROMPT.md") and it will produce a working, deployable app.

---

## Goal

Build **FinanceBuddy**: a buy-side flavored single-ticker dashboard. A user types a ticker → gets a full report on a single page: snapshot, composite 0-100 score with sub-scores, fair value range, fundamentals, growth, momentum, news + next earnings date, and a star to save the ticker to a watchlist.

Personal use first, deployable to Vercel for shareability and a future paid tier.

## Stack (locked)

- **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**
- **yahoo-finance2** (npm) for prices, fundamentals, statements, historical chart data — free, no API key
- **Finnhub** free tier for news + next earnings date — requires free key, but the app must degrade gracefully if `FINNHUB_API_KEY` is missing
- **Recharts** for the price chart
- Deploy target: **Vercel**

## Working directory

`C:/Users/manee/Claude/financebuddy/` (already exists; FUTURE_UPDATES.md already lives here — don't overwrite it).

There's a partial scaffold under `src/` and root config files from an earlier pass. **Treat it as a starting point you can keep, extend, or replace.** If you keep it, verify each file matches the spec below; if anything diverges, fix it. The two pieces most worth preserving are `src/lib/score.ts` (composite scoring rubric) and `src/lib/fairvalue.ts` (DCF + Graham + P/E methodology) — they were thought through carefully.

After you finish, the only command the user should need is:

```bash
cd financebuddy
npm install
npm run dev
```

…and `http://localhost:3000` should work without a Finnhub key (news section politely says "add your key to enable").

## Pages

### `/` — home
- Hero with a big SearchBar (placeholder: "Enter a ticker — AAPL, MSFT, NVDA…")
- Below: Watchlist component (reads localStorage, shows saved tickers as a clickable list)
- Below that: 4-6 example ticker chips the user can click (AAPL, MSFT, NVDA, GOOGL, BRK-B, COST)

### `/[ticker]` — ticker page (the main view)
Sections, top to bottom:
1. **Header strip**: ticker, company name, sector · industry, exchange. Right side: current price (large), $ change + % change (color-coded green/red), market cap. Far right: ☆ watchlist toggle button.
2. **FinanceBuddy Score** — big composite number with a one-line thesis. Below it, four sub-score cards: Value, Growth, Momentum, Quality. Each card shows the sub-score, a colored progress bar, and the underlying drivers (e.g., "Forward P/E 18.2 — 75 pts").
3. **Fair Value card** — low/mid/high band, verdict pill (Undervalued / Fair / Overvalued), visual band with current-price marker, list of estimates (2-stage DCF, Reverse DCF, Graham, P/E based, Analyst target) with notes on assumptions.
4. **Price chart** — Recharts line chart, 1Y default, range toggle (1M / 3M / 1Y / 5Y), with 50-day and 200-day moving average overlays.
5. **Metrics tables** — grid of 8 small panels (Valuation, Profitability, Balance sheet, Cash & yield, Growth, Per share, Momentum, Analyst). Numbers right-aligned, monospaced, "—" for missing data. Never render `NaN` or `undefined`.
6. **News & catalysts** — last 5-10 Finnhub headlines with source + date, and next earnings date in the header. If no Finnhub key, show a polite notice with a link to https://finnhub.io/register.

### Visual style
Dark terminal-ish theme — Bloomberg-flavored. Tailwind palette:

```
bg     #0a0e14   (page)
panel  #0f1620   (cards)
panel2 #141c28   (hover)
border #1f2937
ink    #e5e7eb   (primary text)
muted  #9ca3af   (secondary text)
dim    #6b7280   (tertiary)
up     #22c55e   (positive)
down   #ef4444   (negative)
warn   #facc15
accent #7dd3fc
```

Use a `.num` utility class for tabular monospaced numbers. Use `font-mono` for ticker symbols. Color rule for scores: ≥70 green, 45-69 yellow, <45 red.

## File layout

```
financebuddy/
├── PROMPT.md                  ← this file
├── FUTURE_UPDATES.md          ← keep, don't modify (it's the roadmap)
├── README.md                  ← write a short version
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.example               ← FINNHUB_API_KEY=
├── .env.local                 ← FINNHUB_API_KEY= (empty stub)
├── .gitignore
├── .eslintrc.json
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── page.tsx                       (home)
    │   ├── [ticker]/page.tsx              (server component — fetches snapshot, score, fair value, news)
    │   └── api/
    │       └── chart/[symbol]/route.ts    (returns ChartPoint[] for the client-side chart)
    ├── components/
    │   ├── Header.tsx
    │   ├── SearchBar.tsx                  (client)
    │   ├── Watchlist.tsx                  (client; exports getWatchlist/setWatchlist/toggleTicker helpers)
    │   ├── WatchlistStar.tsx              (client)
    │   ├── ScoreCard.tsx
    │   ├── PriceChart.tsx                 (client; fetches from /api/chart)
    │   ├── MetricsTable.tsx
    │   ├── FairValueCard.tsx
    │   ├── NewsList.tsx
    │   └── formatters.ts                  (re-exports from lib/format under shorter names)
    └── lib/
        ├── types.ts                       (Snapshot, ChartPoint, NewsItem, ScoreReport, SubScore, FairValue)
        ├── format.ts                      (fmtNum, fmtPct, fmtMoney, fmtCompact, fmtDate, safeNum, pctClass)
        ├── yahoo.ts                       (fetchSnapshot, fetchChart)
        ├── finnhub.ts                     (fetchNews, fetchNextEarnings, hasFinnhubKey)
        ├── score.ts                       (buildScoreReport)
        └── fairvalue.ts                   (buildFairValue)
```

## Scoring methodology (mirror the financial-analysis skill rubric)

Composite = `Value × 0.30 + Growth × 0.25 + Momentum × 0.25 + Quality × 0.20` (each 0-100).

Use **piecewise-linear scoring**: each metric has a list of `(input, score)` breakpoints; values are linearly interpolated between them, clamped at the endpoints. Skip null/NaN inputs and re-normalize the weights of remaining drivers.

### Value (weight 0.30)
- Forward P/E (fall back to trailing if missing) — weight 0.25 in pillar
  - Breakpoints: `[5,100] [10,90] [15,75] [20,60] [25,45] [35,25] [60,5] [120,0]`
- PEG — 0.20 — `[0,50] [0.5,95] [1,80] [1.5,60] [2,45] [3,20] [5,0]`
- EV/EBITDA — 0.20 — `[3,100] [6,90] [10,75] [14,55] [20,30] [30,10] [50,0]`
- Price/Book — 0.10 — `[0.5,100] [1,90] [2,75] [3,55] [5,35] [10,10] [20,0]`
- FCF yield — 0.15 — `[-0.05,0] [0,30] [0.02,55] [0.04,75] [0.06,90] [0.10,100]`
- Upside to analyst mean target — 0.10 — `[-0.30,0] [-0.10,30] [0,50] [0.10,70] [0.25,90] [0.50,100]`

### Growth (weight 0.25)
- Revenue YoY — 0.30 — `[-0.20,0] [-0.05,25] [0,40] [0.05,55] [0.10,70] [0.20,85] [0.30,95] [0.50,100]`
- Revenue 3y CAGR — 0.20 — `[-0.10,0] [0,30] [0.05,50] [0.10,65] [0.15,80] [0.25,95] [0.40,100]`
- Earnings YoY — 0.20 — `[-0.30,0] [-0.10,25] [0,45] [0.10,65] [0.20,80] [0.40,95] [0.75,100]`
- EPS 5y CAGR — 0.15 — `[-0.20,0] [0,35] [0.05,50] [0.10,65] [0.20,85] [0.35,100]`
- Gross margin — 0.15 — `[0,0] [0.20,35] [0.35,60] [0.50,80] [0.70,95] [0.85,100]`

### Momentum (weight 0.25)
- Price vs 50-day MA (relative %) — 0.20 — `[-0.20,0] [-0.10,25] [-0.02,45] [0,55] [0.05,70] [0.10,85] [0.20,100]`
- Price vs 200-day MA — 0.20 — `[-0.30,0] [-0.15,25] [-0.05,45] [0,55] [0.10,75] [0.25,90] [0.50,100]`
- RSI(14) — 0.15 — `[10,30] [25,55] [35,70] [50,85] [60,90] [70,70] [80,40] [90,10]` (sweet spot 50-65)
- 3-month return — 0.15 — `[-0.30,0] [-0.10,30] [0,50] [0.05,65] [0.15,85] [0.30,100]`
- 1-year return — 0.20 — `[-0.40,0] [-0.15,25] [0,50] [0.10,65] [0.25,80] [0.50,95] [1.0,100]`
- % from 52w high (signed) — 0.10 — `[-0.50,25] [-0.30,45] [-0.15,65] [-0.05,85] [0,90] [0.05,75]`

### Quality (weight 0.20)
- Debt/Equity (normalize: yahoo sometimes returns 120 meaning 1.2x → divide by 100 if `>5`) — 0.25 — `[0,100] [0.3,90] [0.6,75] [1.0,60] [1.5,40] [2.5,20] [4.0,0]`
- Current ratio — 0.15 — `[0.5,0] [1.0,40] [1.5,70] [2.0,90] [3.0,100]`
- FCF margin — 0.25 — `[-0.10,0] [0,35] [0.05,55] [0.10,70] [0.20,90] [0.30,100]`
- Operating margin — 0.15 — `[-0.10,0] [0,35] [0.05,50] [0.10,65] [0.20,85] [0.35,100]`
- ROE — 0.20 — `[-0.10,0] [0,30] [0.05,50] [0.10,65] [0.15,80] [0.25,95] [0.40,100]`

### Thesis line (one sentence)
Build it deterministically from the four sub-scores. Pattern:

> "{name} screens as {value tone} with {growth tone}, {momentum tone}, and a {quality tone}. Strongest signal: {top pillar} ({score}/100)."

Tone bands: ≥70 strong, 45-69 moderate, <45 weak. Map to phrases like "attractively valued / fairly valued / richly valued" for Value, "strong growth / modest growth / soft growth" for Growth, etc.

## Fair value methodology

Compute four **independent** point estimates plus a sanity-check, then roll into a low/mid/high band.

1. **2-stage DCF** (`fairvalue.ts`)
   - Inputs: TTM free cash flow, shares outstanding
   - Growth assumption: prefer revenue 3y CAGR; fall back to revenue YoY; fall back to earnings YoY; fall back to 8%. Cap explicit-period growth at 25% and floor at -5%.
   - Discount rate 9%, terminal growth 3%, 5-year explicit period
   - Skip if FCF ≤ 0 or shares missing
2. **Reverse DCF** — bisection over `g ∈ [-0.10, 0.40]` to find the growth rate that makes DCF equal current market cap. **Output is a growth rate, not a price** — surface it in the estimates list as informational only.
3. **Graham number** — `√(22.5 × trailingEPS × bookValuePerShare)`. Skip if either is ≤ 0.
4. **P/E based** — `forwardEPS × 18` (fall back to trailing EPS). Skip if EPS ≤ 0. Note "fwd EPS × 18× target P/E".
5. **Analyst mean target** — include if `targetMeanPrice` and `numberOfAnalysts` are present.

Roll-up: collect all numeric point estimates (skip the reverse-DCF growth rate, which has no price). `low = min`, `high = max`, `mid = median`. Verdict:
- price `< low` → Undervalued
- price `> high` → Overvalued
- otherwise → Fair
- nothing computable → Insufficient data

`upsidePct = (mid - price) / price` when both exist.

## Data layer behavior

- `fetchSnapshot(symbol)` calls `yahooFinance.quoteSummary` with all useful modules in one shot. **Wrap in try/catch** and retry with a smaller safe set (`price`, `summaryDetail`, `defaultKeyStatistics`, `financialData`, `summaryProfile`, `calendarEvents`) if the full set 404s.
- Use `yahooFinance.suppressNotices(["yahooSurvey", "ripHistorical"])` once at module load to keep the dev console clean.
- For chart data, fetch ~250 extra trading days **before** the requested range so the 50/200-day MAs are populated from the start of the visible window. Trim points whose date is before the visible cutoff.
- Compute these client-side / server-side from history when Yahoo doesn't provide them: `rsi14`, `pctFromHigh`, `pctFromLow`, `perf1m / 3m / 6m / 1y` (use 21/63/126/252 trading-day offsets).
- Set `next` cache hints when calling Finnhub: `revalidate: 1800` for news, `21600` for the earnings calendar.
- For the snapshot fetch in the page, wrap in `unstable_cache` from `next/cache` with TTLs: prices 5 min, fundamentals 24h. (Actually simplest: cache the whole `fetchSnapshot` for 5 minutes — fundamentals don't change intraday and the small staleness is fine.)
- Handle `BRK-B` / `BRK.B` style tickers — yahoo-finance2 expects `BRK-B`.

## Important defensive patterns

- All format helpers must tolerate `null | undefined | NaN` and return `"—"`.
- Snapshot fields are nullable. Components must render `"—"` not `"NaN"` or `"undefined"`.
- Wrap the `[ticker]/page.tsx` in a try/catch and render a friendly "Couldn't load $TICKER — is it a valid ticker?" instead of crashing on bad input.
- Never log API keys.

## Watchlist

- Single localStorage key: `financebuddy:watchlist:v1`
- Helpers in `Watchlist.tsx`: `getWatchlist()`, `setWatchlist(list)`, `toggleTicker(symbol)` returning the new saved state
- After mutation, dispatch a custom event `financebuddy:watchlist-changed` so other tabs/components can react
- Star button on the ticker page reflects current state and toggles on click

## Acceptance checklist (verify before saying "done")

1. `npm install` runs cleanly with no errors
2. `npm run build` completes with 0 TypeScript errors
3. `npm run dev` starts; `http://localhost:3000` renders home with search and (empty) watchlist
4. Visiting `/AAPL` renders within 5 seconds and shows: header strip with price + change %, composite score with all 4 sub-scores, fair value card with at least 2 estimates and a verdict, price chart with both MA overlays visible, all 8 metrics panels populated (some "—" is fine), and either news (if key set) or the "add your key" notice
5. Without `FINNHUB_API_KEY` set, the page still loads end-to-end — only the news section degrades
6. With a bad ticker like `/ZZZZZZ`, the page shows a friendly error message, not a stack trace
7. Star button on the ticker page persists across reloads
8. Range toggle on the chart re-fetches and re-renders without the page jumping

## Out of scope for v1 (don't build, but read FUTURE_UPDATES.md)

- 10-K parsing / SEC EDGAR integration
- Full balance sheet / cash flow statement panels
- Peer comparison / multi-ticker compare
- Auth / paid tier / Supabase
- LLM-based summarization (no paid AI APIs)

These are documented in `FUTURE_UPDATES.md` — leave that file untouched.

## When you finish

1. Run `npm run build` and fix anything that breaks
2. Print: a one-line summary of what was built, the path to the financebuddy directory, and the three commands to run it locally
3. Remind the user to grab a free Finnhub key at https://finnhub.io/register and paste it into `.env.local` to light up the news panel
