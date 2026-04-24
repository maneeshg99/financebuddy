# FinanceBuddy

A single-ticker research dashboard with a composite 0–100 score, fair-value band, session
stats, and news — wrapped in a Bloomberg-terminal-style UI.

**Live:** https://financebuddy-nine.vercel.app

---

## What it does

Type a ticker. Get:

- **Composite score (0–100)** across four pillars — Value, Growth, Momentum, Quality —
  each with transparent sub-drivers.
- **Fair value band** derived from five independent methods: two-stage DCF, reverse DCF,
  Graham number, P/E multiple, and analyst consensus. Rolled up into a low / mid / high
  band plus a verdict (Undervalued / Fair / Overvalued / Insufficient data).
- **Price panel** — collapsible chart with 50d and 200d moving averages, plus a dense
  session strip (prev close, day range, volume, 52w range, 1M/3M/6M/1Y performance).
- **Five tabs** for the rest: SCORE · VALUE · FINANCIALS · ANALYSIS · NEWS. Tab state is
  driven by the URL (`/AAPL?t=financials`).
- **Local watchlist** via `localStorage` — no account required.

## Stack

- [Next.js 14](https://nextjs.org) (App Router, Server Components, `unstable_cache`)
- TypeScript
- [Tailwind CSS](https://tailwindcss.com) + custom BBG v1 theme (IBM Plex Mono,
  orange accent, yellow press-data digits, cyan links)
- [Recharts](https://recharts.org) for the price chart
- [yahoo-finance2](https://github.com/gadicc/node-yahoo-finance2) for quotes +
  fundamentals (free, no API key)
- [Finnhub](https://finnhub.io) for news + earnings dates (free tier, optional)

## Run locally

```bash
npm install
# drop your Finnhub key into .env.local (see Environment below)
npm run dev
```

### Environment

| Name | Required | Purpose |
|---|---|---|
| `FINNHUB_API_KEY` | optional | Enables news feed + upcoming earnings. Get a free key at [finnhub.io/register](https://finnhub.io/register). |
| `NEXT_PUBLIC_SITE_URL` | optional | Override the canonical URL used in `robots.ts` and `sitemap.ts`. |

The site works without `FINNHUB_API_KEY` — it just hides the NEWS tab's feed with a
one-line placeholder.

## Scripts

```bash
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Serve the production build
npm run lint     # ESLint
```

## Structure

```
src/
├── app/
│   ├── [ticker]/              # per-ticker dashboard (5 tabs + price panel)
│   ├── api/chart/[symbol]/    # chart data endpoint for client-side fetching
│   ├── privacy, terms, data-sources/  # legal + transparency pages
│   ├── layout.tsx, page.tsx   # root layout + home
│   ├── not-found.tsx, robots.ts, sitemap.ts
│   └── opengraph-image.tsx + icon.tsx  # generated via ImageResponse
├── components/                # ScoreCard, FairValueCard, MetricsTable, ChartSection, …
├── lib/
│   ├── yahoo.ts               # Yahoo snapshot + chart fetchers
│   ├── finnhub.ts             # News + earnings
│   ├── score.ts               # Composite scoring
│   ├── fairvalue.ts           # DCF + reverse DCF + Graham + P/E + analyst
│   ├── env.ts                 # Zod-validated env
│   ├── types.ts, format.ts    # Shared types + formatters
└── middleware.ts              # Content-Security-Policy
```

## Roadmap

See [ROADMAP.md](./ROADMAP.md) — 87 items across 5 phases.

## Disclaimer

FinanceBuddy is an educational and research tool. Nothing here is investment advice. See
[/terms](https://financebuddy-nine.vercel.app/terms) for full terms.

## License

MIT. Personal-use project — not affiliated with Yahoo Finance, Finnhub, or Bloomberg L.P.
