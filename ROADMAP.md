# FinanceBuddy — Roadmap

A phased list of improvements, ordered by urgency. Each item is tagged with its **source**
(who proposed it) and its **effort** estimate.

**Source:**
- `draft` — from the initial author's list
- `perfector` — added by the `/perfector` review loop
- `both` — independently identified by both

**Effort:**
- `S` — ≤ ½ day
- `M` — 1–3 days
- `L` — 3+ days or requires a new dependency / major feature

---

## Phase 0 — Ship blockers
Must do before inviting anyone to use the site publicly. **13 items — all ✅ shipped in commit `c702553`.**

| Category | Item | Source | Effort | Status |
|---|---|---|---|---|
| Operational | Dynamic OG image endpoint (default + per-ticker) | draft | M | ✅ |
| Operational | Favicon + `apple-touch-icon.png` | draft | S | ✅ |
| Operational | `app/not-found.tsx` — BBG-themed 404 | draft | S | ✅ |
| Operational | `app/robots.ts` + `app/sitemap.ts` | draft | S | ✅ |
| Operational | Legal pages: `/privacy`, `/terms`, `/data-sources` | draft | M | ✅ |
| Operational | `README.md` for the GitHub repo | draft | S | ✅ |
| Reliability | Input regex validation on chart route before hitting Yahoo | perfector | S | ✅ |
| Reliability | Error boundary at `app/[ticker]/error.tsx` with retry | perfector | S | ✅ |
| Security | Content-Security-Policy via Next middleware | perfector | M | ✅ |
| Security | HSTS + Permissions-Policy + Referrer-Policy headers | perfector | S | ✅ |
| Security | Zod env validation — fail fast on missing `FINNHUB_API_KEY` | draft | S | ✅ |
| Analytics | Vercel Analytics + Speed Insights enabled | draft | S | ✅ |
| Compliance | Data licensing audit — Yahoo TOS for intended scale | perfector | S | ✅ |

---

## Phase 1 — Hardening & quality
Before the site sees real organic traffic. **17 items.**

| Category | Item | Source | Effort |
|---|---|---|---|
| Testing | Unit tests for `score.ts` (interpolation, aggregate, thesis) | perfector | M |
| Testing | Unit tests for `fairvalue.ts` (DCF, reverse DCF, Graham) | perfector | M |
| Testing | Integration tests for `yahoo.ts` with mocked responses | perfector | M |
| Testing | Visual regression (Chromatic / Percy) | perfector | L |
| Testing | Lighthouse CI on every PR with perf + a11y budgets | perfector | M |
| Testing | Automated axe-core a11y check on main routes | perfector | M |
| Dev Experience | GitHub Actions CI — lint + typecheck + build + test on PR | perfector | S |
| Dev Experience | Prettier + Husky + lint-staged pre-commit hook | perfector | S |
| Dev Experience | Separate `test` and `typecheck` npm scripts | perfector | S |
| Dev Experience | Dependabot config for monthly security PRs | perfector | S |
| Dev Experience | `.vscode/settings.json` + recommended extensions committed | perfector | S |
| Reliability | Uptime monitor (Better Stack) on `/` and `/AAPL` | perfector | S |
| Reliability | Finnhub quota meter — alert at 80% of 60 rpm | perfector | M |
| Reliability | `/api/health` — cache hit rates + last-Yahoo timestamp | perfector | S |
| Reliability | Sentry Performance (transactions, not just errors) | perfector | S |
| Security | Finnhub key rotation schedule + secondary fallback key | perfector | M |
| Documentation | `/methodology` page — scoring, DCF assumptions, sources | perfector | M |

---

## Phase 2 — UX polish & accessibility
Moves product from "works" to "feels good." **22 items.**

| Category | Item | Source | Effort |
|---|---|---|---|
| Performance | Stream ticker page via `<Suspense>` boundaries | perfector | M |
| Performance | `loading.tsx` per route with BBG-style skeleton | perfector | M |
| Performance | SWR on client for `/api/chart` range switches | perfector | S |
| Performance | Lazy-load Recharts only when ChartSection is expanded | perfector | S |
| Performance | `React.cache()` wrap around `fetchSnapshot` | perfector | S |
| Navigation | Keyboard shortcuts — `1`–`5` tabs, `/` search focus, `?` shortcut list | both | M |
| Navigation | Preserve active tab on ticker change via search | both | S |
| Navigation | Breadcrumb indicator in header | draft | S |
| Navigation | Home ticker tape — scroll watchlist with live deltas | draft | L |
| UI polish | Score-driver tooltips — raw value + mapping on hover | perfector | M |
| UI polish | Print stylesheet (tear-sheet feel on `Cmd+P`) | perfector | S |
| UI polish | Mobile tab nav collapse to `<select>` under `md` | perfector | M |
| UI polish | Copy-link button near ticker symbol | perfector | S |
| UI polish | Session clock + market-status pill in HeaderStrip | perfector | M |
| UI polish | Text labels + icons beside color-coded score bars | perfector | S |
| Accessibility | `aria-live="polite"` announce on tab change | perfector | S |
| Accessibility | Contrast audit on dim tokens (borderline WCAG AA) | perfector | S |
| Accessibility | Skip-to-content link | draft | S |
| Accessibility | Focus-ring audit across interactive elements | draft | S |
| Accessibility | `prefers-reduced-motion` respect | draft | S |

---

## Phase 3 — Data & feature depth
Genuine analytical capability. **22 items.**

| Category | Item | Source | Effort |
|---|---|---|---|
| Valuation | Multi-ticker compare page (`/compare?symbols=…`) | draft | L |
| Valuation | Sensitivity panel on FairValueCard — discount + terminal growth sliders | draft | M |
| Valuation | Historical composite-score trendline overlay | draft | L |
| Valuation | Custom composite weights (Value / Growth / Momentum / Quality) | draft | M |
| Valuation | Peer card — same-industry scoreboard | draft | L |
| Session data | After-hours / pre-market price in price panel | perfector | M |
| Session data | Bid / ask spread during market hours | perfector | M |
| Session data | Beta, implied volatility, put/call ratio | draft | M |
| Analyst | Rating distribution (strong buy / buy / hold / sell / strong sell) | perfector | M |
| Analyst | Upgrade / downgrade timeline (last 90 days) | perfector | L |
| Analyst | Earnings history with beat/miss badges | both | M |
| Fundamentals | Margin / revenue / FCF sparklines (4–8 quarters) | perfector | L |
| Fundamentals | Dividend history + payout consistency (new Quality driver) | draft | M |
| Fundamentals | Ex-dividend + payment dates | perfector | S |
| Fundamentals | Buyback announcements feed | perfector | L |
| Fundamentals | Insider transactions (Form 4 timeline) | draft | L |
| Fundamentals | Institutional ownership (13F top holders + %) | both | L |
| Fundamentals | Short interest / borrow rate (FINRA) | draft | M |
| News | News sentiment scoring per headline | draft | L |
| Workflow | Per-ticker user target price + delta to composite mid | perfector | M |
| Workflow | CSV / JSON export per ticker | perfector | S |
| Workflow | Watchlist table view with live deltas + sortable columns | perfector | L |
| Workflow | Drag-and-drop reorder in watchlist | perfector | M |
| Workflow | ETF passthrough (expand into top holdings with composite) | draft | L |

---

## Phase 4 — Platform & scale
Account layer, broader market coverage, positioning. **10 items.**

| Category | Item | Source | Effort |
|---|---|---|---|
| Account | Supabase / Clerk auth for cross-device sync | draft | L |
| Account | Notes per ticker (localStorage → backend) | draft | M |
| Account | Alerts ("notify when AAPL composite ≥ 70") | draft | L |
| Account | Saved screens (watchlist + filter rules) | draft | L |
| Breadth | Non-US tickers (LSE, TSX, Asian exchanges) | draft | M |
| Breadth | Crypto support (BTC-USD etc.) | draft | S |
| Breadth | Mobile PWA manifest + icons | draft | S |
| Breadth | Per-currency display for non-US tickers | perfector | M |
| Positioning | `/about` page (differentiation vs SWS / Koyfin / YF) | perfector | S |
| Positioning | Portfolio mode — CSV upload → aggregate composite + exposure | perfector | L |

---

**Totals:** 87 items across 5 phases + backlog. Mix: ~39 `draft` / ~44 `perfector` / 4 `both`. Effort: 37 S · 29 M · 21 L.

---

## Backlog
Items parked until the required external service or decision is in place. Not blocked on code — blocked on a sign-up / purchase / provider pick. **4 items.**

| Category | Item | Source | Effort | Blocked on |
|---|---|---|---|---|
| Operational | Custom domain (buy + `vercel domains add`) | draft | S | Buy a domain, share the name, then I run the CLI + update `NEXT_PUBLIC_SITE_URL` |
| Reliability | Snapshot KV / Upstash Redis caching (5 min) | draft | M | Free [Upstash Redis](https://upstash.com) DB — paste `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` |
| Reliability | Rate limiting on `/api/chart/[symbol]` | draft | S | Same Upstash DB as above (reused) |
| Reliability | Error observability (Sentry) | draft | M | Free [Sentry](https://sentry.io) project — paste `SENTRY_DSN` |
