import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://financebuddy-nine.vercel.app";

// Seed ticker list for sitemap — covers the tickers the home page already exposes
// plus a small pool of common mega-caps to give crawlers a realistic graph.
const SEED_TICKERS = [
  "AAPL",
  "MSFT",
  "NVDA",
  "GOOGL",
  "AMZN",
  "META",
  "TSLA",
  "BRK-B",
  "JPM",
  "V",
  "UNH",
  "XOM",
  "COST",
  "WMT",
  "HD",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/data-sources`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
  const tickerPages: MetadataRoute.Sitemap = SEED_TICKERS.map((t) => ({
    url: `${SITE}/${t}`,
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.8,
  }));
  return [...staticPages, ...tickerPages];
}
