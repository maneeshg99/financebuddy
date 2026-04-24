# Data Licensing Audit

Quick audit of data-source terms for FinanceBuddy's current usage pattern. Personal-use,
non-commercial, low-traffic Vercel deployment. **Re-audit before any monetization,
third-party redistribution, or traffic beyond a few hundred daily actives.**

Audit date: **2026-04-23**.

---

## Yahoo Finance — via `yahoo-finance2`

**Library:** [gadicc/node-yahoo-finance2](https://github.com/gadicc/node-yahoo-finance2)

**Status:** Yahoo does not publish a formal public API for quotes/fundamentals. The data
accessed by `yahoo-finance2` is scraped from endpoints that power the Yahoo Finance
website. Yahoo's [Terms of Service](https://policies.yahoo.com/us/en/yahoo/terms/product-atos/apiforydn/index.htm)
forbid large-scale scraping, republication, and commercial use without a license.

**Where we stand:**
- ✅ **Personal research use** — likely acceptable under fair-use in most jurisdictions.
- ⚠️ **Public-facing site** — grey area. A site that displays Yahoo-derived data to any
  visitor (including authenticated users) is technically closer to redistribution than
  personal use.
- ❌ **Commercial use / ads / paid tier** — would require a direct license from Yahoo
  (Refinitiv, ICE, or comparable licensed feed is the industry path).
- ❌ **API access by third parties** — our `/api/chart/[symbol]` route would need to be
  behind auth + rate limits if traffic grew.

**Risk level today:** Low, given low traffic and no commercial intent. Yahoo does not
typically pursue small hobby projects, but they do send C&D letters to sites that rank
in search results for Yahoo data.

**Mitigations already in place:**
- Snapshot responses are cached 5 minutes server-side (`unstable_cache`) — reduces
  upstream volume.
- No redistribution of raw Yahoo JSON via API; our chart endpoint returns
  derived-and-reshaped data (close + MAs).

**Actions if monetized / scaled:**
1. Switch to a licensed feed (Polygon.io, IEX Cloud, Tiingo, Alpaca Market Data).
2. Add a "data provided by X" attribution that matches the new provider's TOS.
3. Remove `yahoo-finance2` from the dependency tree.

---

## Finnhub — News + upcoming earnings

**API:** [finnhub.io](https://finnhub.io) — REST, requires API key.

**Status:** Finnhub's [Terms](https://finnhub.io/terms-of-service) explicitly permit
personal use, hobby projects, and paid commercial use (with an appropriate plan tier).
The free tier allows 60 requests per minute; paid tiers scale to the API's documented
limits.

**Where we stand:**
- ✅ **Free tier for personal use** — permitted.
- ✅ **Attribution** — Finnhub is credited in `/data-sources` and the footer.
- ✅ **Caching** — news cached 30 minutes server-side, earnings cached 6 hours.
- ⚠️ **Key exposure** — current setup stores `FINNHUB_API_KEY` only as a server env var;
  no client-side leak.

**Risk level today:** None.

**Actions if scaled:**
1. Upgrade to the paid plan tier matching production rpm.
2. Consider a secondary fallback provider for news (NewsAPI, Polygon news endpoints) to
   avoid single-vendor risk.

---

## Recharts / Next.js / Tailwind / IBM Plex Mono

All MIT / OFL-licensed. No restrictions relevant to FinanceBuddy's usage.

---

## Summary

| Source | Personal use | Public (low traffic) | Commercial |
|---|---|---|---|
| Yahoo Finance (via yahoo-finance2) | ✅ | ⚠️ grey | ❌ needs license |
| Finnhub (free tier) | ✅ | ✅ | ⚠️ needs paid tier |
| All libraries | ✅ | ✅ | ✅ |

**Go / no-go for current deployment:** Go. Fine for the current non-commercial, low-traffic
state. Re-audit the moment any of the following happen:
- Domain handoff to a commercial entity
- Monetization (ads, subscription, paid tier)
- Cross-posting / redistribution beyond Vercel's direct URL
- Sustained traffic above ~1,000 daily actives
