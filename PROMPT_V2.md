# FinanceBuddy v2 — Upgrade Prompt for Claude Code

Paste this entire file into Claude Code from the `financebuddy/` directory and say "execute PROMPT_V2.md". Do NOT delete `FUTURE_UPDATES.md` or `PROMPT.md` — both are reference material.

## TL;DR for Claude Code

- **Goal:** turn FinanceBuddy from a metrics dump into a junior-analyst-grade research cockpit a buy-side MD would accept.
- **Shape:** 7 tabs (Overview, Valuation, Statements, Quality, Growth, Ownership, Filings).
- **New muscles:** Piotroski/Altman/Beneish quality scores, Margin of Safety, Interactive DCF + Sensitivity heatmap + Bull/Base/Bear, full statements (annual + quarterly), SEC EDGAR integration (filings list, 10-K risk factors with YoY diff), peer comparison drawer, functional Bloomberg keyboard chrome.
- **Constraints:** free data sources only (yahoo-finance2, Finnhub free, SEC EDGAR). `EDGAR_USER_AGENT` env var is mandatory and must be validated at startup.
- **Phasing:** P0 fixes existing bugs + ships the highest-leverage new features. P1 fills MD-grade depth. P2 polishes (peers, mobile, narrative). Ship in this order; build must be clean after every phase.
- **Don't touch:** `FUTURE_UPDATES.md`, `PROMPT.md`, the `theme-bbg-v1` Bloomberg styling. Do replace the non-functional widgets it produces.

Read the rest in full before writing code.

---

## 0. Context

FinanceBuddy v1 is live at https://financebuddy-nine.vercel.app. It works but it is **not yet useful for real investment decisions** — it surfaces ~40 raw Yahoo metrics behind a Bloomberg-styled chrome and calls that "analysis." A serious retail investor (someone who would actually act on this data) cannot answer the most basic questions on the current site:

- Is the current valuation expensive or cheap **vs. its own history**?
- How does it compare to **peers**?
- Is the **balance sheet** healthy? What's the debt maturity wall?
- What's the **earnings quality** (FCF / Net Income, accruals, accounting red flags)?
- What are **insiders** doing? Who **owns** it?
- What's **management saying** in filings? What changed in risk factors?
- If I change the **DCF assumptions**, what does it imply?
- What are the **bull / base / bear** cases?

Your job is to upgrade FinanceBuddy from "data dump with chrome" to **MD-from-analyst quality** — the bar is "I would act on this." Pack the page with everything a junior analyst at a long-only fund would put together for an MD on a single name, and present it cleanly.

The user has confirmed the following constraints:

- **Target user:** serious retail / DIY investor (buy-side flavored)
- **Data budget:** free only — `yahoo-finance2`, **Finnhub free tier**, and **SEC EDGAR** (free, official, requires User-Agent header). No paid feeds for v2.
- **Depth strategy:** firehose AND curated — every metric must justify its place AND there must be many of them. Use progressive disclosure (collapsibles, drawers) to manage density.
- **Chrome:** wire up the existing `<HELP>` / `<MENU>` / `<GO>` chrome to be functional. No more decorative-only widgets. **Keep the existing `theme-bbg-v1` Bloomberg styling intact** — only delete the non-functional fake-widget bars; do not refactor the dark theme.
- **Page structure:** 7 tabs, denser per tab (see §3).
- **Peer comparison:** auto-pull 4-5 peers from `yfinance` industry; user can swap/add/remove; saved in `localStorage` per ticker.

### 0.1 Required environment variables (validate at server startup — fail loud)

The `lib/env.ts` zod-validated env module must add:

| Var | Required? | Purpose |
|---|---|---|
| `FINNHUB_API_KEY` | optional | News + earnings (existing — degrades gracefully) |
| `EDGAR_USER_AGENT` | **required** for SEC EDGAR features | Format: `"FinanceBuddy contact@yourdomain.com"`. EDGAR returns 403 without a real User-Agent. The `lib/edgar.ts` module **must refuse to make requests and throw a developer-facing error if this is missing or doesn't include an `@`** — silent failure here will get the deployment IP-banned by SEC. Document this prominently in `README.md`. |

---

## 1. Current state — what to fix or remove BEFORE adding new things

These are bugs and UX failures shipped today. Fix them in P0 (see §4 for phasing).

### 1.1 Score drivers show points, not values (CRITICAL)

The Score tab today renders driver rows like `Forward P/E   37`. That `37` is the **score points**, not the actual P/E. Users assume it's the metric. Fix: render `Forward P/E   28.92  →  60 pts` — actual value first (left), score points right with arrow + "pts" suffix. Apply across all four pillars.

### 1.2 Empty states are bare em-dashes

`EPS 5y CAGR: —` tells the user nothing. Replace with `— (need ≥5y of EPS history)` or `— (insufficient data)` with a tooltip explaining the requirement.

### 1.3 Decorative chrome that does nothing

The footer line `<HELP> FOR HELP   <MENU> FOR FAVORITES   FB-01 EQUITY` and the header strip with the same fake widgets do nothing. **Wire them up per §6** — replace the decorative line with real clickable shortcuts that match real keybindings. Do not delete the Bloomberg `theme-bbg-v1` styling itself (orange/yellow palette, monospace, sharp corners) — that aesthetic is part of the brand. The rule is: **every visible "widget" must do something.**

### 1.4 Fair value band shows a misleading verdict

For AAPL today, the fair value page shows `Fair`, range `$32.65 → $297.71`, with a "to mid: -47.1%" note. The Graham number for a tech mega-cap with low book value is essentially noise; including it as a band endpoint makes the band span 9x. Fix: when a method's value is more than 2 standard deviations from the median of the other estimates, **exclude it from the band** but still show it in the "Estimates" list with a tag like `(excluded as outlier)`. Verdict and band must be defensible.

### 1.5 Footer overlap with disclaimer

The footer currently has both decorative chrome and a disclaimer. Pick one tone — keep the disclaimer + privacy/terms/sources links. Remove the chrome line.

### 1.6 News tab is the weakest

Headlines aren't categorized, no sentiment, no surprise table from earnings. See §3.7.

---

## 2. Vision

FinanceBuddy v2 is **the page a buy-side analyst opens in the morning before a meeting on a single name**. It should answer, in one scrollable session per tab:

1. *Should I be doing more work on this?* (Overview)
2. *What's it worth?* (Valuation — with my own assumptions)
3. *What does the underlying business look like?* (Statements)
4. *What can break it?* (Quality & Risk)
5. *Where is the growth coming from?* (Growth)
6. *Who else owns it and what are they doing?* (Ownership)
7. *What is management saying / what changed?* (Filings & News)

Every metric is shown with **context**: vs. its own 5y history (z-score / sparkline), and where peer comparison is on (vs. peer median). No naked number stands alone.

---

## 3. New page structure — 7 tabs

Tabs: **OVERVIEW · VALUATION · STATEMENTS · QUALITY · GROWTH · OWNERSHIP · FILINGS**

Tab keys 1-7 switch tabs (see §6). Tab state is persisted in URL (`?t=overview` etc.) — preserve from v1.

For every tab, the **header strip** (price, change, market cap, star) stays sticky. The **peer drawer** (§5) is accessible from any tab via the `B` key or the "Peers" button in the header strip.

### 3.1 Tab 1 — OVERVIEW

The 30-second answer. Goal: glance and decide whether to dig in.

- **Composite Score** (existing) — fix the driver display per §1.1.
- **Quality flags row** — three badges side by side:
  - **Piotroski F-Score** `7/9` (color: 7-9 green, 4-6 yellow, 0-3 red) — clickable, opens a popover listing the 9 individual checks pass/fail.
  - **Altman Z-Score** `3.42 — Safe` (Safe ≥3.0 / Grey 1.81-3.0 / Distress <1.81). Use Z" for non-manufacturers.
  - **Beneish M-Score** `-2.45 — Low risk` (low <-1.78 / high ≥-1.78). Tooltip: "earnings manipulation likelihood".
- **Margin of Safety** — large badge with formula `MoS = (fair_value_mid − price) / price`. Display as `+12% margin of safety` (green, MoS ≥ +20% strong, +5–20% modest) or `−8% premium` (red, MoS < −10% expensive). Wired to the v2 valuation engine post-outlier-exclusion.
- **Snapshot grid** (3 cols × 4 rows = 12 metrics, each with a 5-yr sparkline next to the value):
  - Price · Market cap · Forward P/E · EV/EBITDA
  - FCF yield · Dividend yield · ROIC · Net debt / EBITDA
  - Revenue (TTM) · Revenue growth (YoY) · FCF (TTM) · EPS (TTM)
- **Thesis & Risk lines** — two deterministic sentences derived from the data, each color-coded (thesis blue, risk amber). E.g. "Apple screens as fairly valued with strong quality (FB Score 63/100). Primary risks: high P/B (45x) reflects leveraged buyback, China revenue concentration, and a flat 3y revenue CAGR (1.8%)."
- **5y price chart** with 50d/200d MA — collapsed to 240px height by default, expandable.

### 3.2 Tab 2 — VALUATION

Where the analyst spends 20 minutes.

- **Fair Value band card** — improved per §1.4 (exclude outlier methods from the band).
- **Five valuation methods** (existing 5 + 1 new) with each method's assumptions visible:
  1. 2-stage DCF
  2. Reverse DCF
  3. Graham number
  4. P/E based
  5. Analyst mean target
  6. **NEW — Earnings Power Value (Greenwald)** — `Sustainable EBIT × (1 - tax rate) / WACC`. Conservative valuation that ignores growth.
- **NEW: Interactive DCF panel** — sliders / number inputs the user can edit live:
  - Year 1-5 revenue growth (%)
  - Steady-state operating margin (%)
  - Tax rate (%)
  - WACC / discount rate (%) [default 9%]
  - Terminal growth (%) [default 3%]
  - Net debt (auto-filled from data, editable)
  - Shares outstanding (auto-filled from data, editable)
  - Output: implied share price, updated in real time. Show formula above output as a small expandable "show calculation" link.
- **NEW: Sensitivity heatmap** — 5×5 grid. **Y axis = WACC: 7%, 8%, 9%, 10%, 11%** (1% steps). **X axis = terminal growth: 1%, 2%, 3%, 4%, 5%** (1% steps). Each cell holds the implied price for that combination, **using the user's current Interactive DCF assumptions for everything else** (revenue growth, margin, tax). Color-grade each cell vs. current price: green when implied > current by ≥10%, yellow ±10%, red when implied < current by ≥10%. Highlight (border + bold) the cell matching the user's current WACC × terminal growth.
- **NEW: Bull / Base / Bear scenarios** — three explicit DCF runs. The growth assumption draws from analyst consensus when available (`yfinance earningsTrend.0.growth` or `financialData.revenueGrowth`); when **no consensus is available**, fall back to the company's own 3y revenue CAGR — and if that's also missing, fall back to 8%. Display the source ("consensus" / "3y CAGR" / "default") in the scenario sub-label.
  - **Bull**: growth = max(base × 1.3, base + 5pp), op margin = current + 200 bps, WACC = 8%
  - **Base**: growth = base, op margin = current, WACC = 9%
  - **Bear**: growth = max(base × 0.5, base − 5pp), op margin = current − 200 bps, WACC = 10%
  - Display per scenario: implied price + IRR (vs. current price, 5y horizon) + probability-weighted price using user-set probability sliders (default 25/50/25 — must sum to 100, auto-rebalance if user moves one).
- **NEW: Historical valuation context** — 4 sparkline cards in a 2×2 grid: P/E, P/S, EV/EBITDA, P/B. Each shows current value, 5y mean, 5y median, current z-score (e.g. "+1.8σ from 5y mean — expensive"). Pull from `chart` historical close + ratios.
- **NEW: Reverse DCF interpretation** — replace the cryptic "Market is pricing in 22.1% growth" with a sentence like: `"At $271, the market is pricing in ~22% FCF growth for 5 years. Analyst consensus expects 8%. Apple's 5y historical CAGR was 1.8%. The market is pricing in a substantial reacceleration."`

### 3.3 Tab 3 — STATEMENTS

The financials, properly. Annual / Quarterly toggle at the top right.

- **Income Statement** — 5 years (annual) or 8 quarters (quarterly), every line: Revenue · Cost of Revenue · Gross Profit · Operating Expenses (R&D, SG&A breakdown when separately reported) · Operating Income · Interest Expense · Pretax Income · Tax · Net Income · EPS (basic + diluted; if yfinance gives only one, label "(diluted)" or "(basic)" inline). Each row shows the YoY change % in a thin column. Toggle: **"Common-sized"** view recomputes every line as % of revenue. The common-sized toggle is **income-statement-only** — it makes no sense for the balance sheet or cash flow and should not appear there.
- **Balance Sheet** — 5y/8q, every line: Cash & equivalents · Short-term investments · AR · Inventory · Total current assets · PP&E · Goodwill · Intangibles · Total assets · AP · Short-term debt · Total current liabilities · Long-term debt · Total liabilities · Common stock · Retained earnings · Total equity. Show working capital + net debt computed lines.
- **Cash Flow Statement** — 5y/8q: Operating CF (Net income + D&A + Working cap changes + Other) · Capex · Acquisitions · Other investing · Total investing CF · Dividends · Buybacks · Debt issued/repaid · Total financing CF · Net change in cash. Compute Free Cash Flow = OCF − Capex.
- **Segment revenue** — pie + 3y stacked bar where data is available (yfinance `quoteSummary` + EDGAR fallback for segments). For AAPL: iPhone, Services, Mac, iPad, Wearables. **If unavailable, hide section gracefully** with a placeholder explaining why.
- **Geographic revenue** — pie + bar. Same fallback rule.
- **Capital allocation** — 5y stacked bar showing **uses of cash only** (positive values). Categories: Capex (gray), Dividends paid (blue), Buybacks net (cyan, max(0, gross repurchases − issuance)), Acquisitions (orange), Net debt repaid (purple, max(0, repayment − issuance)). When a year is net debt-issuer or net share-issuer, **don't go negative on the stacked bar** — render those years' outflows only, and add a small annotation `+$Xb debt issued` or `+Xm shares issued` underneath. Add a "Total return to shareholders" overlay line = dividends + net buybacks.
- **Share count history** — 10y line chart. Title: "Diluted shares outstanding". Annotate net buyback or net dilution per year as small bar overlay.

### 3.4 Tab 4 — QUALITY & RISK

What can break this company.

- **Piotroski F-Score breakdown** — full table of 9 checks with current values + pass/fail badge. (Formulas in §7.1.)
- **Altman Z-Score breakdown** — show each of the 4 ratios in Z" formula. (§7.2)
- **Beneish M-Score breakdown** — show each of the 8 indices. (§7.3)
- **Margin trend chart** — 5y line: gross / operating / net margin all on one chart. Highlight inflection points.
- **Returns chart** — 5y line: ROIC / ROE / ROA on one chart.
- **Working capital cycle** — DSO, DIO, DPO, CCC (cash conversion cycle) bar chart over 5y.
- **Debt profile**:
  - Net debt / EBITDA (current + 5y trend)
  - Interest coverage ratio (EBIT / interest expense)
  - Debt maturity wall — bar chart of debt due by year (pull from EDGAR 10-K notes when available; show placeholder if not)
- **Earnings quality flags** — auto-computed:
  - **FCF / Net Income ratio** — last 5y average. Flag if <0.8 or trending down.
  - **Accruals ratio** — `(Net Income − OCF) / Total Assets`. Flag if >0.05.
  - **Goodwill as % of equity** — flag if >50%.
  - **Stock-based comp as % of revenue** — flag if >10% (relevant for tech).
- **Risk badges row** — 6 badges, each red/yellow/green based on thresholds (table in §7.5):
  Liquidity · Leverage · Profitability · Concentration · Dilution · Cash quality
- **Beta + volatility** — current beta, 1y realized vol.

### 3.5 Tab 5 — GROWTH

Where is growth coming from and where is it going.

- **Revenue history + forecast** — 10y historical bars + 3y analyst consensus forward bars (different color). Show YoY growth % above each bar.
- **EPS history + forecast** — same shape.
- **Quarterly trend** — last 8q revenue + EPS bar chart with sequential and YoY % overlays.
- **Margin progression** — 5y: gross → operating → net margin waterfall (% of revenue) showing where the gap goes.
- **R&D intensity** — R&D as % of revenue, 5y trend. Note vs industry median (use sector default if peer-set R&D not available).
- **Capex intensity** — Capex / revenue, 5y trend.
- **Reinvestment rate** — `(Capex + Acquisitions − D&A) / Net Income` — proxy for how much earnings get plowed back.
- **Segment growth rates** — table: each segment, latest revenue, YoY %, 3y CAGR. Sortable.
- **Geographic growth rates** — same table for regions.

### 3.6 Tab 6 — OWNERSHIP

Who owns it, what are they doing, what are they paid.

- **Insider ownership** — total % held by insiders, plus a table of recent insider transactions (last 6 months) with date, insider name, role, transaction type (Buy / Sell / Option exercise), shares, value. Source: yfinance `insiderTransactions` + `insiderHolders`. If empty, fall back to EDGAR Form 4 list with link.
- **Institutional ownership** — total %, plus top 10 institutional holders table (name, % held, $ value, change QoQ where available). Source: yfinance `institutionOwnership` + `fundOwnership`.
- **Short interest** — % of float, days to cover, short ratio trend (4 most recent reporting periods). Source: yfinance `defaultKeyStatistics.shortPercentOfFloat`, `shortRatio`.
- **Float vs total** — float as % of shares outstanding.
- **Dividend history table** — last 5 years of payments: ex-date, payment date, amount, yield at that price, YoY growth. Plus a card with "Dividend growth streak: X years".
- **Dividend safety** — three sub-metrics with thresholds and color: Payout ratio (target <70%), FCF coverage (target >1.5x), Net debt / EBITDA (target <3x).
- **Executive comp summary** (when available from EDGAR DEF 14A): top 5 NEOs with total comp, % stock-based. Skip cleanly if unavailable.

### 3.7 Tab 7 — FILINGS & NEWS

Management voice + the regulatory paper trail.

- **Next earnings date** + **Earnings surprise table** — last 4 quarters: Date · Consensus EPS · Reported EPS · Surprise % · Stock reaction next day (%). Color-code surprise green/red. Source: Finnhub `stock/earnings` for consensus + actual; **next-day reaction must be computed locally** by joining each earnings date to yfinance daily OHLC: `(close on D+1 − close on D) / close on D`, where D is the earnings date (or D−1 if the report came after-market — use Finnhub's `hour` field if present, else default to "after market" assumption).
- **News headlines** (Finnhub) — categorized chips at top: All · Earnings · Product · Legal/Reg · M&A · Analyst · Capital return · Other. Use deterministic keyword classification (regex over headline text — examples in §7.6). **Each headline can carry up to 2 tags** (multi-label), not first-match-wins, because real headlines mix topics ("Apple beats Q4 on iPhone strength" is both Earnings and Product). Display only the first 2 matching tags per headline. **Chip filter behavior:** clicking a chip shows headlines whose tag set *contains* that tag (any-of match), not whose primary tag equals it. Chips are mutually exclusive in the UI (clicking another chip replaces the filter); `All` clears.
- **SEC filings list** — last 20 from EDGAR with filing type (10-K, 10-Q, 8-K, DEF 14A, Form 4, etc.), filing date, link to the filing. Filter chips: All · Annual · Quarterly · Material events · Proxy · Insider.
- **8-K item summaries** — last 30 days. Show the **Item code** (e.g. 2.02 Results of Operations and Financial Condition) with its standard description from the EDGAR mapping.
- **Risk factors snapshot** — pull "Item 1A. Risk Factors" first 2 paragraphs from the latest 10-K. Below that, a **"What changed since last year"** section: a **paragraph-level** diff (split each year's text on `\n\n` and compare paragraph sets, not words — word-level diffs blow up on 50–100 page documents). Surface up to 8 added paragraphs (in green) and 8 removed paragraphs (in red), each truncated to ~280 chars with "…" + an "Open full risk factors ↗" link to the EDGAR HTML. Rank by paragraph length (longer = more substantive). **If the prior year's 10-K isn't found**, render the current snapshot only with a note: "No prior 10-K available for comparison." Use `diff` npm package on the paragraph arrays.
- **Earnings call link** — link to most recent transcript on Seeking Alpha or the company IR page (best-effort URL construction; if uncertain, link to IR page from the EDGAR company facts).
- **Conference call audio link** — same source as transcript.

---

## 4. Phased build plan

If you can't ship everything in one go, ship in this order. Each phase must be fully working before moving on. After each phase, run `npm run build` and verify zero errors.

### P0 — Fix what's broken + add the most-painful gaps (must ship)

Order is roughly easiest-first to keep build green; do not skip ahead.

1. Fix score drivers (§1.1) — show actual values + pts.
2. Fix empty states (§1.2) — explain missing data inline.
3. Fix fair value band outlier handling (§1.4).
4. Implement Margin of Safety badge (§3.1).
5. Wire up keyboard shortcuts (§6) — `1-7` tab switch, `?` help, `/` search, `B` peers, `S` star.
6. Wire SEC EDGAR plumbing (`lib/edgar.ts`, ticker→CIK build-time bundle, env validation, rate limiter) — even before any EDGAR-dependent UI ships, the foundation must be in.
7. Implement quality scores: Piotroski, Altman, Beneish (§7.1, §7.2, §7.3).
8. Implement Historical Valuation Context (4 sparklines on Valuation tab).
9. Implement Interactive DCF + Sensitivity heatmap (client island, see §9.5).
10. Add Statements tab (Income / Balance Sheet / Cash Flow with annual+quarterly toggle, common-sized toggle on income statement only).
11. Add Earnings Surprise table (last 4 quarters with computed next-day reaction).
12. Wire EDGAR-backed UI: list last 20 filings with type + link on Filings tab.

### P1 — MD-grade depth (should ship)

12. Add Quality & Risk tab in full (margin trend, returns chart, working capital cycle, risk badges).
13. Add Growth tab in full (revenue+EPS forecast, segment growth).
14. Add Ownership tab — insider, institutional, short interest, dividend safety.
15. Add Bull/Base/Bear scenarios on Valuation tab.
16. Add EPV (Earnings Power Value) as 6th valuation method.
17. Add segment + geographic revenue (pie + stacked bar) on Statements tab.
18. Add capital allocation chart on Statements tab.
19. News categorization with deterministic keyword classifier (§7.6).
20. Risk factors snapshot + year-over-year diff on Filings tab.

### P2 — Peer compare + polish (nice to ship)

21. Implement Peer Drawer (§5) — auto-pull peers, side-by-side ratio table, override + persistence.
22. Reverse DCF narrative interpretation (§3.2, last bullet).
23. Mobile breakpoints (§9).
24. Settings / preferences (default DCF assumptions, theme).
25. Per-ticker notes (localStorage; v2 of v3 sync to Supabase).

---

## 5. Peer comparison drawer

A right-side drawer accessible from any tab via the `B` key or a "Peers" button in the sticky header.

- **Auto peer set:** on first visit to a ticker, fetch the company's `industry` from yfinance `summaryProfile`. Use `yahooFinance.search()` or the unofficial `recommendationsBySymbol` to pick the top 5 peers by market cap in the same industry. Cache in `localStorage` per ticker.
- **Manual override:** user can remove any peer (X) and add any ticker (search input). Saves to `localStorage` as `financebuddy:peers:v1:<TICKER>`.
- **Comparison columns:** Price · Market cap · Forward P/E · PEG · EV/EBITDA · P/S · ROE · ROIC · FCF margin · Net debt / EBITDA · Revenue growth (YoY) · FB Composite Score.
- **Coloring:** per row across columns, best value gets `text-up`, worst gets `text-down`. Median gets default color. Use the same lower-is-better rule from §9 sparkline-invert: for P/E, PEG, EV/EBITDA, P/S, Net debt/EBITDA → lower is "best". For ROE, ROIC, FCF margin, Revenue growth, FB Score → higher is "best".
- **Peer score caching is critical** (otherwise opening the drawer triggers 5 full snapshot fetches). Wrap `getPeerSnapshot(symbol)` in `unstable_cache` with 1h TTL. Fetch all 5 peers' snapshots in `Promise.all` server-side when the drawer opens (use a Server Action or a `/api/peers/[symbol]/comparison` route). Loading state: skeleton rows for ~1s on first open, instant on subsequent opens.
- **Click any peer ticker** → navigate to their page (their peer drawer carries over their own peer set).

---

## 6. Functional Bloomberg chrome

Replace the decorative chrome with real shortcuts. Add a small floating help overlay (`?` to open) that lists them.

| Key | Action |
|---|---|
| `1` … `7` | Switch tabs (Overview through Filings) |
| `/` | Focus the ticker search box |
| `?` (i.e. `Shift+/` on US layouts — listen for both `event.key === "?"` and the shifted slash) | Toggle keyboard shortcut overlay |
| `B` | Toggle peer comparison drawer |
| `S` | Star / unstar current ticker |
| `W` | Open watchlist drawer (replaces the home Watchlist's only-on-home access) |
| `Esc` | Close any open drawer or overlay |

**Input-safety rule:** the global key handler must early-return when `document.activeElement` is an `<input>`, `<textarea>`, `<select>`, or any element with `[contenteditable="true"]`. Otherwise typing a ticker into the search box would switch tabs as you type.

The header chrome should display these as clickable buttons too (not just decorative). Replace the `<HELP> FOR HELP <MENU> FOR FAVORITES` decoration with: `[1] OVERVIEW  [2] VALUATION  [3] STATEMENTS  [4] QUALITY  [5] GROWTH  [6] OWNERSHIP  [7] FILINGS  ·  [B] PEERS  [W] WATCHLIST  [?] HELP`. Active tab highlighted accent.

---

## 7. Formulas, thresholds, and classifiers

### 7.1 Piotroski F-Score (0-9, higher = healthier)

Award 1 point each. Inputs from prior + current annual statements.

1. Net Income > 0 (current year)
2. Operating Cash Flow > 0 (current year)
3. ROA improved YoY (current ROA > prior ROA)
4. OCF > Net Income (current year — earnings quality)
5. Long-term debt / Assets decreased YoY
6. Current Ratio improved YoY
7. No new shares issued (diluted shares this year ≤ prior)
8. Gross margin improved YoY
9. Asset turnover (Revenue / Total Assets) improved YoY

Score: sum of points. Render as `7/9` with category badge: `Strong (7-9)` green, `Average (4-6)` yellow, `Weak (0-3)` red.

### 7.2 Altman Z" Score (modified, for non-manufacturers)

```
Z" = 6.56 × (Working Capital / Total Assets)
   + 3.26 × (Retained Earnings / Total Assets)
   + 6.72 × (EBIT / Total Assets)
   + 1.05 × (Book Value of Equity / Total Liabilities)
```

Bands: `Safe ≥ 2.6`, `Grey 1.1 – 2.6`, `Distress < 1.1`.

### 7.3 Beneish M-Score

8 indices computed from prior + current annual statements (subscript t = current, t-1 = prior). All ratios use raw values from the income statement, balance sheet, and cash flow statement.

```
DSRI = (AR_t / Sales_t) / (AR_{t-1} / Sales_{t-1})
GMI  = ((Sales_{t-1} - COGS_{t-1}) / Sales_{t-1}) / ((Sales_t - COGS_t) / Sales_t)
AQI  = (1 - (CA_t + PPE_t) / TA_t) / (1 - (CA_{t-1} + PPE_{t-1}) / TA_{t-1})
SGI  = Sales_t / Sales_{t-1}
DEPI = (Dep_{t-1} / (Dep_{t-1} + PPE_{t-1})) / (Dep_t / (Dep_t + PPE_t))
SGAI = (SGA_t / Sales_t) / (SGA_{t-1} / Sales_{t-1})
TATA = (NetIncome_t - OCF_t) / TA_t
LVGI = ((LTD_t + CL_t) / TA_t) / ((LTD_{t-1} + CL_{t-1}) / TA_{t-1})

M = -4.84 + 0.92×DSRI + 0.528×GMI + 0.404×AQI + 0.892×SGI
        + 0.115×DEPI − 0.172×SGAI + 4.679×TATA − 0.327×LVGI
```

Threshold: `M > -1.78` → flag elevated earnings manipulation risk. Show the value with a Low / Elevated / High badge.

**Important:** Beneish was developed for non-financial corporates. **Skip the badge entirely for banks, insurers, and asset managers** (sectors `Financial Services` with industries containing `Bank`, `Insurance`, `Asset Management`, `Capital Markets`). Show the badge as `N/A — not meaningful for financials` and skip the calculation.

### 7.4 Earnings Power Value (Greenwald)

```
Sustainable EBIT = average of last 5 years' EBIT (smooths cycle; if <5y available, use what's there with min 3y, else skip)
Adjusted EBIT    = Sustainable EBIT × (1 − effective tax rate)
EPV operating    = Adjusted EBIT / cost_of_capital
EPV equity       = EPV operating + Excess Cash − Total Debt
EPV per share    = EPV equity / diluted shares outstanding
```

For consistency with the DCF in this app, **use WACC (9% default)** as the cost of capital. Greenwald's original formulation uses cost of capital broadly; we don't compute a beta-adjusted KE or per-firm WACC in v2, so the same 9% applies. Note this in a tooltip: "EPV uses the same 9% discount as the DCF for consistency. Strict Greenwald would use a per-firm cost of capital."

Excess cash = total cash − max(0, 2% of revenue). The 2% is Greenwald's rule of thumb for working capital cash.

**Skip EPV when** sustainable EBIT is negative or fewer than 3 years of EBIT history exist. Show as `— (need ≥3y of positive EBIT)`.

### 7.5 Risk badge thresholds

Each badge: green / yellow / red.

| Badge | Green | Yellow | Red |
|---|---|---|---|
| Liquidity | Current ratio ≥ 1.5 | 1.0 – 1.5 | < 1.0 |
| Leverage | Net debt / EBITDA ≤ 2 | 2 – 4 | > 4 |
| Profitability | Operating margin ≥ 15% | 5 – 15% | < 5% |
| Concentration | Top customer < 10% revenue | 10 – 25% | > 25% (from 10-K disclosure) |
| Dilution | Diluted share count YoY ≤ 0% | 0 – 3% | > 3% |
| Cash quality | OCF / Net Income ≥ 0.9 (5y avg) | 0.7 – 0.9 | < 0.7 |

### 7.6 News categorization (deterministic, no LLM)

Test the lowercased headline against ALL rules; collect every match (multi-label) and keep up to 2 tags per headline (in the order tested). If zero match, tag `Other`.

```
/lawsuit|sued|settle|investigat|antitrust|doj\b|\bsec\b|fine\b|probe\b|subpoena/   → Legal/Reg
/acqui|merger|buy(s|out)|takeover|spin-?off|divest|tender offer/                   → M&A
/dividend|buyback|repurchase|split|capital return/                                  → Capital return
/upgrade|downgrade|target\s*price|rated|initiat(e|ed)|analyst|reiterat/             → Analyst
/earnings|q[1-4]\b|quarterly|guidance|beats|misses|\beps\b|revenue|miss(es|ed)/     → Earnings
/launch|unveil|release|product|service|app\b|platform|new model/                    → Product
```

Order matters because Legal/Reg, M&A, and Capital Return are usually the most-decision-relevant tags — surfacing them first when a headline qualifies for multiple categories is intentional. Test in the order shown.

---

## 8. Data sources — which API for which metric

This is the contract. If a source isn't listed, default to yfinance with a graceful fallback to "—".

| Metric / section | Primary source | Fallback / notes |
|---|---|---|
| Quote, fundamentals snapshot | yfinance `quoteSummary` | retain v1 wrapper |
| Historical prices (5y, 10y) | yfinance `chart` | needed for valuation z-scores |
| Income / Balance / Cash flow statements | yfinance `quoteSummary` modules: `incomeStatementHistory`, `incomeStatementHistoryQuarterly`, `balanceSheetHistory`, `balanceSheetHistoryQuarterly`, `cashflowStatementHistory`, `cashflowStatementHistoryQuarterly` | EDGAR `companyfacts` JSON for missing lines |
| Insider transactions, holders | yfinance `insiderTransactions`, `insiderHolders` | EDGAR Form 4 list as link-only fallback |
| Institutional holders | yfinance `institutionOwnership`, `fundOwnership` | — |
| Short interest | yfinance `defaultKeyStatistics.shortPercentOfFloat`, `shortRatio` | — |
| Analyst recommendations + EPS revisions | yfinance `recommendationTrend`, `earningsTrend`, `financialData.targetMeanPrice` | Finnhub `stock/recommendation`, `stock/eps-estimate` |
| Earnings surprises history | Finnhub `stock/earnings` | yfinance `earningsHistory` |
| Next earnings date | Finnhub `calendar/earnings` (already wired) | yfinance `calendarEvents` |
| News headlines | Finnhub `company-news` (already wired) | — |
| Segment + geographic revenue | yfinance (limited) | EDGAR XBRL `SegmentReportingDisclosureTextBlock` parse — best-effort, hide cleanly if absent |
| SEC filings list (10-K, 10-Q, 8-K, etc.) | EDGAR `https://data.sec.gov/submissions/CIK{cik}.json` | requires `User-Agent: FinanceBuddy contact@yourdomain.com` header |
| 10-K risk factors text | EDGAR primary doc URL → fetch HTML → extract Item 1A | server-side only, cache 24h |
| Dividend history | yfinance `chart` with events=dividends | — |
| Sector / industry | yfinance `summaryProfile` | needed for peer fetch |
| Peers | yfinance `recommendationsBySymbol` or `search` filtered by sector | manual override always wins |

### EDGAR rules (CRITICAL — read carefully)

- **`User-Agent` is mandatory.** Read from `EDGAR_USER_AGENT` env (validated in `lib/env.ts` per §0.1). The wrapper in `lib/edgar.ts` must throw a clear developer error if the env is missing rather than silently failing — silent failures here can get the Vercel egress IPs banned by SEC.
- **Rate limit: 10 requests/sec max.** Implement a simple in-process token-bucket queue in `lib/edgar.ts`. Don't parallel-blast even within `Promise.all`.
- **Cache aggressively** with `unstable_cache` from `next/cache`:
  - Ticker→CIK map: 7d
  - Submissions list per CIK: 24h
  - Individual filing primary doc HTML: 7d
  - 10-K Risk Factors extracted text: 30d
- **Ticker→CIK lookup strategy** (Vercel serverless = stateless, in-memory cache won't survive cold starts):
  1. **Build-time**: at `next build`, download `https://www.sec.gov/files/company_tickers.json` once and write to `src/data/edgar-tickers.json` (run as a `prebuild` script). Bundle this with the deployment.
  2. **Runtime**: import the bundled JSON. Lookup is O(1) in-memory map. **Do not fetch this at runtime** — there are ~10K tickers and the file is ~1.5 MB, but it's only loaded once on cold start.
  3. **If a ticker isn't in the bundled map** (newly listed company between builds), fetch `company_tickers.json` live, cache via `unstable_cache` for 7d, and use that.
- **For non-US tickers** (ADRs without SEC filings, foreign-only listings): show `EDGAR-dependent UI` panels with a one-line notice: "SEC filings unavailable — issuer does not file with the SEC." Do not throw; degrade.

---

## 9. Visual / UX standards

- **Dark theme stays.** Bloomberg-flavored is fine; just delete the cosmetic-only widgets.
- **Density target (use Tailwind defaults):** `xl:` (≥1280px) shows 4 cards per row; `lg:` (≥1024px) shows 3; `md:` (≥768px) shows 2; under that shows 1 (vertical stack). Use Tailwind responsive prefixes consistently across all new components.
- **Tabs on mobile:** below 640px, collapse the tab strip into a horizontal scroll with snap; the active tab name + "▾" opens a vertical menu.
- **Interactive DCF + Sensitivity on mobile:** below 768px, render the Interactive DCF as a single-column form (sliders stack vertically, values shown as large numbers above each slider). The Sensitivity heatmap stays 5×5 but font shrinks to 10px and the cell padding tightens; allow horizontal scroll if needed. The Bull/Base/Bear scenarios stack vertically.
- **Sparklines:** consistent — 60×20 px, no axes, just the line, with start/end dots. Color is **directional**, not brand-uniform: use `text-up` (green) when end > start, `text-down` (red) when end < start, `text-muted` (grey) when flat (within ±2%). **Invert the convention only for valuation multiples where lower = cheaper:** P/E, P/B, P/S, EV/EBITDA, EV/Revenue. Do NOT invert for return/yield/quality metrics: ROIC, ROE, ROA, FCF yield, dividend yield, margins, revenue, EPS, FCF — for these, higher is unambiguously better.
- **Numbers:** monospace, tabular-nums, right-aligned in tables. Negative values in `text-down`. Up-trend in `text-up`.
- **Empty states:** never just `—`. Always `— (reason)` with a `?` icon tooltip if the reason needs explanation.
- **Loading:** skeleton blocks per panel (not a global spinner). The header strip must always render first; panels can fill in.
- **Tooltips:** every metric label has a tooltip explaining the metric in one sentence. Use a single `<MetricLabel name="ROIC" tooltip="..." />` component to keep them consistent.
- **Currency:** read `currency` from yfinance `price` module. If non-USD, show the symbol's local currency for all per-share values (price, EPS, BV/share, fair value estimates). Market cap, revenue, debt — show in local currency too, do not convert. Tag the page header with currency: e.g. `LSE · GBP` for a UK-listed name. **Don't mix currencies** — if a metric is computed across years with currency changes, prefer the latest year's currency.
- **Consistency:** kill the all-caps "FAIR VALUE /// VAL-02"-style decorative section IDs unless they're actually tied to keyboard shortcuts. Section titles should be useful, not theatrical.

---

## 9.5 Server vs client boundary

This is critical for performance and avoids hydration mismatches.

- **Server components (default):** `[ticker]/page.tsx`, all 7 `tabs/*Tab.tsx`, all data-rendering tables and charts that don't need interactivity (Income statement, Balance sheet, Filings list, Risk badges, etc.).
- **Client components (`"use client"`):** anything with state or event handlers:
  - `InteractiveDCF.tsx`, `SensitivityHeatmap.tsx`, `BullBaseBearScenarios.tsx` (probability sliders)
  - `KeyboardShortcuts.tsx`, `PeerDrawer.tsx`, `WatchlistDrawer.tsx`
  - The Statements `Annual / Quarterly` toggle + the `Common-sized` toggle
  - The chart components that already use SWR (existing `PriceChart.tsx`)
  - `WatchlistStar.tsx` (existing)

Keep client components small islands. Pass data into them as props from server components — do not refetch inside the client component when the server already has the data.

## 9.6 Data fetching strategy (avoid waterfalls)

In `[ticker]/page.tsx` (server component), fire **all data fetches in parallel** with `Promise.all`. Pass the resolved data down into each tab as props. Each tab does **not** fetch its own data.

```
const [snapshot, statements, edgarFilings, peers, news, surprises]
  = await Promise.all([
      fetchSnapshot(symbol),
      fetchStatements(symbol),                  // annual + quarterly together
      fetchEdgarFilings(symbol).catch(() => null), // graceful EDGAR fail
      fetchPeerSet(symbol).catch(() => []),
      fetchNews(symbol).catch(() => []),
      fetchEarningsSurprises(symbol).catch(() => []),
    ]);
```

Wrap each fetcher in `unstable_cache` with the TTLs in §8. Tab switches are pure URL changes — no refetch. Only chart range toggles and the interactive DCF cause client-side updates.

If a fetch fails, log it server-side and pass `null` to that tab. Tabs render an `EmptyState` for null data.

## 10. New + changed files (suggested layout)

```
src/
├── app/
│   ├── [ticker]/
│   │   ├── page.tsx                        (server component — fetch + compose)
│   │   └── tabs/                           (each tab is a server component)
│   │       ├── OverviewTab.tsx
│   │       ├── ValuationTab.tsx
│   │       ├── StatementsTab.tsx
│   │       ├── QualityTab.tsx
│   │       ├── GrowthTab.tsx
│   │       ├── OwnershipTab.tsx
│   │       └── FilingsTab.tsx
│   └── api/
│       ├── chart/[symbol]/route.ts          (existing)
│       ├── statements/[symbol]/route.ts     (NEW — annual+quarterly switch)
│       ├── filings/[symbol]/route.ts        (NEW — EDGAR submissions)
│       ├── filings/[symbol]/risk-factors/route.ts (NEW — 10-K Item 1A + diff)
│       └── peers/[symbol]/route.ts          (NEW — auto peer set)
├── components/
│   ├── chrome/
│   │   ├── KeyboardShortcuts.tsx           (NEW — `?` overlay + global key handler)
│   │   ├── PeerDrawer.tsx                  (NEW)
│   │   └── WatchlistDrawer.tsx             (NEW — replaces home-only watchlist)
│   ├── valuation/
│   │   ├── FairValueCard.tsx               (existing — fix outlier handling)
│   │   ├── InteractiveDCF.tsx              (NEW)
│   │   ├── SensitivityHeatmap.tsx          (NEW)
│   │   ├── BullBaseBearScenarios.tsx       (NEW)
│   │   ├── HistoricalValuationContext.tsx  (NEW)
│   │   └── ReverseDCFNarrative.tsx         (NEW)
│   ├── statements/
│   │   ├── IncomeStatementTable.tsx        (NEW)
│   │   ├── BalanceSheetTable.tsx           (NEW)
│   │   ├── CashFlowTable.tsx               (NEW)
│   │   ├── SegmentBreakdown.tsx            (NEW)
│   │   ├── CapitalAllocationChart.tsx      (NEW)
│   │   └── ShareCountHistory.tsx           (NEW)
│   ├── quality/
│   │   ├── PiotroskiScoreCard.tsx          (NEW)
│   │   ├── AltmanScoreCard.tsx             (NEW)
│   │   ├── BeneishScoreCard.tsx            (NEW)
│   │   ├── MarginTrendChart.tsx            (NEW)
│   │   ├── ReturnsChart.tsx                (NEW)
│   │   ├── WorkingCapitalCycle.tsx         (NEW)
│   │   ├── DebtProfile.tsx                 (NEW)
│   │   └── RiskBadgeRow.tsx                (NEW)
│   ├── growth/
│   │   ├── RevenueForecastChart.tsx        (NEW)
│   │   ├── EpsForecastChart.tsx            (NEW)
│   │   ├── MarginWaterfall.tsx             (NEW)
│   │   ├── SegmentGrowthTable.tsx          (NEW)
│   │   └── GeoGrowthTable.tsx              (NEW)
│   ├── ownership/
│   │   ├── InsiderTransactionsTable.tsx    (NEW)
│   │   ├── InstitutionalHoldersTable.tsx   (NEW)
│   │   ├── ShortInterestPanel.tsx          (NEW)
│   │   ├── DividendHistoryTable.tsx        (NEW)
│   │   └── DividendSafetyCard.tsx          (NEW)
│   ├── filings/
│   │   ├── EarningsSurpriseTable.tsx       (NEW)
│   │   ├── FilingsListTable.tsx            (NEW)
│   │   ├── RiskFactorsSnapshot.tsx         (NEW)
│   │   └── EightKItemSummaries.tsx         (NEW)
│   ├── overview/
│   │   ├── QualityFlagsRow.tsx             (NEW)
│   │   ├── MarginOfSafetyBadge.tsx         (NEW)
│   │   ├── SnapshotGrid.tsx                (NEW)
│   │   └── ThesisAndRisk.tsx               (NEW)
│   ├── shared/
│   │   ├── Sparkline.tsx                   (NEW)
│   │   ├── MetricLabel.tsx                 (NEW — label + tooltip)
│   │   ├── EmptyState.tsx                  (NEW — "— (reason)")
│   │   └── ZScoreBadge.tsx                 (NEW)
│   └── ... existing components
└── lib/
    ├── yahoo.ts                             (existing — extend modules)
    ├── finnhub.ts                           (existing — add earnings surprises)
    ├── edgar.ts                             (NEW — submissions, filings, risk-factor extraction, ticker→CIK cache)
    ├── score.ts                             (existing — keep but render values + pts)
    ├── fairvalue.ts                         (existing — fix outlier band)
    ├── quality.ts                           (NEW — Piotroski, Altman, Beneish, EPV, risk badges)
    ├── valuation.ts                         (NEW — DCF engine, sensitivity grid, scenarios)
    ├── peers.ts                             (NEW — auto-pick + persistence helpers)
    ├── classify-news.ts                     (NEW — keyword regex classifier)
    ├── format.ts                            (existing)
    └── types.ts                             (existing — extend with new types)
```

---

## 11. Acceptance criteria — verify before declaring done

After P0:
1. `npm run build` clean, zero TS errors.
2. `/AAPL` Overview tab shows: composite score with **values + pts** in drivers, three quality badges (Piotroski expected ~6–8 for AAPL = Strong/Average green; Altman Z" expected ~3+ = Safe green; Beneish expected < −2 = Low risk green), Margin of Safety badge with sign matching the fair value verdict.
3. `/AAPL` Valuation tab shows the Interactive DCF — moving any slider updates the implied price within 50ms, no fetch.
4. `/AAPL` Valuation tab shows the 5×5 sensitivity heatmap with the current-assumption cell highlighted.
5. `/AAPL` Valuation tab shows historical valuation context — 4 sparklines with z-score badges.
6. `/AAPL` Statements tab shows income, balance sheet, cash flow tables with annual/quarterly toggle. Common-sized toggle works on income statement.
7. `/AAPL` Filings tab shows last 20 SEC filings with type + date + working link.
8. `/AAPL` Filings tab shows last 4 earnings surprises.
9. Pressing `1`-`7` switches tabs. Pressing `?` opens shortcut overlay. Pressing `B` opens peer drawer.
10. Bare em-dashes are gone — every empty state has a one-line reason.

After P1:
11. All 7 tabs are populated end-to-end for `AAPL`, `MSFT`, `JPM`, `XOM` (test 4 sectors).
12. Risk badges row computes correctly for `AAPL` as of late 2025 data (expected: Liquidity **Red** — current ratio ~0.97 < 1.0; Leverage Green — net debt / EBITDA < 1; Profitability Green; Concentration **Yellow / Unknown** unless 10-K is parsed; Dilution Green — net buybacks; Cash quality Green — OCF > NI). For `JPM`, expect Beneish badge to show `N/A — not meaningful for financials`.
13. News categorization tags at least 80% of headlines correctly (manual spot check 20 headlines on `AAPL`).
14. Risk factors year-over-year diff renders for `AAPL` with at least 5 added/removed phrases highlighted.

After P2:
15. Peer drawer opens with 5 auto-pulled peers for `AAPL`. Removing/adding peers persists across reload.
16. Mobile breakpoint (390px width): all tabs render without horizontal scroll, tables become card lists or horizontally scroll within their container.
17. Run `/MSFT`, `/JPM`, `/XOM`, `/BRK-B`, `/NVDA`, `/UNH` end-to-end smoke test — no crash, no `NaN`, no `undefined` in any visible string.
18. Mobile test — keyboard shortcuts gracefully no-op on touch devices.

### Non-functional

- Cold load of `/AAPL` Overview tab: under 4s on a fresh build with cache cleared.
- Tab switches inside the same ticker: instant (data already on the server-rendered page; tabs are URL-driven sections).
- Lighthouse a11y score on `/AAPL` Overview tab: ≥90.
- **Internationalization smoke test:** `/ASML` (Netherlands ADR — has SEC filings) and `/TM` (Toyota ADR — has SEC filings) render without crashes. EDGAR-dependent panels work for these. For a non-SEC-filer like `/NSRGY` (Nestle ADR via OTC — files 20-F not 10-K), the EDGAR panels gracefully show "filings unavailable" if the parser fails on 20-F structure — don't crash.

### TypeScript types to add to `lib/types.ts`

- `IncomeStatementRow`, `BalanceSheetRow`, `CashFlowRow` (named line items, all `number | null`)
- `StatementSet` = `{ annual: Row[]; quarterly: Row[] }` for each statement
- `EdgarFiling` = `{ accession: string; form: string; filingDate: string; primaryDoc: string; primaryDocUrl: string; period?: string }`
- `Peer` = `{ symbol: string; name: string | null; metrics: Record<string, number | null>; fbScore: number | null }`
- `EarningsSurprise` = `{ date: string; quarter: string; consensus: number | null; actual: number | null; surprisePct: number | null; nextDayReturn: number | null }`
- `InsiderTxn`, `InstitutionalHolder`, `DividendPayment` — straightforward field-by-field
- `QualityScores` = `{ piotroski: PiotroskiResult; altman: AltmanResult; beneish: BeneishResult | null }` (Beneish nullable for financials)
- `DcfAssumptions` and `DcfResult` (used by Interactive DCF)
- `RiskFactorsDoc` = `{ year: number; paragraphs: string[]; sourceUrl: string }`

---

## 12. Things explicitly NOT in this scope (push to v3 / FUTURE_UPDATES)

- Auth / login / Supabase
- Per-ticker notes synced cross-device (localStorage v2 is fine)
- LLM summarization of filings or news
- Email or push alerts
- Portfolio CSV upload
- Crypto / options / futures
- Real-time streaming prices
- Programmatic SEO directory pages

These belong in the existing `FUTURE_UPDATES.md` — append any new ones you defer here.

---

## 13. Before you start

Read these existing files first (the v1 already implements the foundations):

- `src/lib/yahoo.ts` — extend, don't rewrite
- `src/lib/finnhub.ts` — extend with earnings surprises
- `src/lib/score.ts` — keep the breakpoint engine, fix the driver display
- `src/lib/fairvalue.ts` — fix outlier exclusion in `buildFairValue`
- `src/lib/format.ts`, `src/lib/types.ts` — extend
- `src/components/ScoreCard.tsx`, `FairValueCard.tsx`, `MetricsTable.tsx` — these will get refactored as parts of the new tabs
- `src/app/[ticker]/page.tsx` — needs to become the parallel-fetch parent
- `src/app/globals.css` — keep `theme-bbg-v1` intact, only edit the chrome-specific selectors
- `package.json` — see what's already installed; you'll need to add: `diff`, `swr` (already there)

Update `README.md` at the end to document: (1) the new `EDGAR_USER_AGENT` env var requirement, (2) the 7-tab structure, (3) the keyboard shortcuts table from §6.

## 14. When you finish

1. Run `npm run build` — fix anything broken.
2. Run `npm run lint` — fix anything broken.
3. Hit `/AAPL`, `/MSFT`, `/JPM`, `/XOM`, `/NVDA`, `/ASML`, `/TM` in dev — confirm each tab renders without errors and EDGAR-dependent panels degrade gracefully on non-filers.
4. Print to chat:
   - One paragraph: what shipped (P0 / P1 / P2 — explicit list of acceptance criteria passed).
   - One paragraph: what was deferred and why (append to `FUTURE_UPDATES.md` if new items emerged).
   - The three commands: `cd financebuddy && npm install && npm run dev`.
   - A reminder to set `EDGAR_USER_AGENT="FinanceBuddy <email>"` in `.env.local` — the EDGAR module **will refuse to make requests** without it (per §0.1).
