# FinanceBuddy — Future Improvements (Draft, before /perfector)

## Operational / ship-blockers
1. Custom domain — currently `financebuddy-nine.vercel.app`. Buy a domain, attach via `vercel domains add`.
2. Snapshot caching in Vercel KV / Upstash Redis — 5-minute server cache per symbol so Yahoo 429s don't crash pages.
3. Rate limiting on `/api/chart/[symbol]` (Upstash @ratelimit, IP-keyed) — the route is currently open to spamming.
4. Error observability — replace `console.error` in `[ticker]/page.tsx` with Sentry or a Vercel log drain.
5. Vercel Analytics + Speed Insights — one flip each in the dashboard.
6. OG image + metadata — `app/[ticker]/opengraph-image.tsx` so tickers have rich link previews.
7. Favicon / apple-touch-icon — currently default Next.js favicon.
8. `app/not-found.tsx` — brutal-terminal-styled 404.
9. `app/robots.ts` + `app/sitemap.ts` for SEO.
10. Legal/data-source pages — `/privacy`, `/terms`, `/data-sources` links in footer (currently only the disclaimer).
11. README.md — repo has none.
12. Zod startup validation for env vars — fails fast on missing `FINNHUB_API_KEY` in prod.

## Tab / navigation UX
13. Keyboard shortcuts for tab switching — press `1`–`5` to jump between SCORE/VALUE/FIN/ANALYSIS/NEWS (matches the BBG `<1>` affordance).
14. Preserve tab on ticker change — when user searches a new ticker while on ANALYSIS, land them on `/NEWSYM?t=analysis`. Currently resets to default.
15. Expand-all button on ChartSection — remember open state globally, not per-visit, and consider an "expand chart on all tickers" toggle.
16. Breadcrumb / back-to-home in header — currently clicking "FB" in header goes home but no visible breadcrumb.
17. Home page ticker tape — scroll saved-watchlist symbols with live deltas (needs a `/api/quotes?symbols=…` endpoint).

## Valuation depth
18. Multi-ticker compare — `/compare?symbols=AAPL,MSFT,NVDA` stacking 2-4 composite scores side-by-side.
19. Sensitivity panel on FairValueCard — live slider for DCF discount rate (6%–12%) and terminal growth (1%–5%), band updates live.
20. Historical composite-score trendline — score-over-time overlay on the CHART section (pre-computed at cache time).
21. Custom composite weights — slider for Value / Growth / Momentum / Quality so advanced users can tune their lens.
22. Peer card — auto-pull 3-5 same-industry tickers, show their composite scores as a mini leaderboard.

## Data breadth
23. Dividend history + payout consistency score (new Quality driver).
24. Short interest / borrow rate — FINRA has free daily short-volume feeds.
25. Insider transactions (Form 4) — timeline below the chart section.
26. Institutional ownership snapshot (13F top holders).
27. Earnings history with beat/miss badges in the ANALYSIS tab.
28. News sentiment scoring — pair each headline with a polarity score.
29. Beta, implied volatility, put/call ratio in SessionStats.
30. ETF passthrough — if user enters an ETF, expand into top holdings with their composite scores.

## Persistence / account layer
31. Supabase or Clerk auth — cross-device sync of watchlist + notes + custom weights.
32. Notes per ticker — small markdown field saved to localStorage first, later backend.
33. Alerts — "notify me when AAPL composite crosses 70" via email or web push.
34. Saved screens — "my watchlist tickers with composite ≥ 70 and FCF yield ≥ 5%".

## Breadth
35. Non-US tickers (LSE, TSX, Asian) — yahoo-finance2 supports these via suffix; UI just needs to handle `XX.TO` style symbols.
36. Crypto support — Yahoo has `BTC-USD` etc.
37. Mobile PWA manifest — `app/manifest.ts` + icons.

## Accessibility
38. Skip-to-content link for keyboard users.
39. Focus-ring audit — every interactive element has a visible focus style.
40. Reduced-motion respect — chart animations, scanline overlay (when re-added).
