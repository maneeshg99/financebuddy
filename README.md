# FinanceBuddy

A buy-side flavored single-ticker dashboard. Type a ticker, get a full report: snapshot, composite 0-100 score with sub-scores, fair value range, fundamentals, growth, momentum, news, next earnings — and a star to save it.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- [`yahoo-finance2`](https://www.npmjs.com/package/yahoo-finance2) — prices, fundamentals, statements, history (no API key)
- [Finnhub](https://finnhub.io) free tier — news + next earnings (optional; app degrades gracefully without it)
- [Recharts](https://recharts.org) — price chart

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Optional: Finnhub key

Grab a free key at <https://finnhub.io/register> and drop it into `.env.local`:

```
FINNHUB_API_KEY=your_key_here
```

Without a key the page still loads end-to-end — only the news section shows a polite "add your key to enable" notice.

## Project layout

```
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx                     home
│   ├── [ticker]/page.tsx            ticker view (server component)
│   └── api/chart/[symbol]/route.ts  price history for the chart
├── components/                      Header, SearchBar, Watchlist*, ScoreCard, PriceChart, …
└── lib/
    ├── types.ts
    ├── format.ts
    ├── yahoo.ts                     snapshot + chart
    ├── finnhub.ts                   news + next earnings
    ├── score.ts                     composite 0-100 score
    └── fairvalue.ts                 DCF + Graham + P/E + analyst roll-up
```

## Roadmap

See [FUTURE_UPDATES.md](./FUTURE_UPDATES.md).
