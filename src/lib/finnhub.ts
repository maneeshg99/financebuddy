import type { NewsItem } from "./types";

const BASE = "https://finnhub.io/api/v1";

export function hasFinnhubKey(): boolean {
  return !!(process.env.FINNHUB_API_KEY && process.env.FINNHUB_API_KEY.trim().length > 0);
}

function key(): string {
  return (process.env.FINNHUB_API_KEY ?? "").trim();
}

function isoDateDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 24 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}

export async function fetchNews(symbolRaw: string, limit = 10): Promise<NewsItem[]> {
  if (!hasFinnhubKey()) return [];
  const symbol = symbolRaw.trim().toUpperCase().replace(/-/g, ".");
  const to = isoDateDaysAgo(0);
  const from = isoDateDaysAgo(30);
  const url = `${BASE}/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}&token=${key()}`;

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{
      id?: number | string;
      headline?: string;
      source?: string;
      url?: string;
      datetime?: number;
      summary?: string;
    }>;
    return data
      .filter((n) => !!n.headline && !!n.url)
      .slice(0, limit)
      .map((n) => ({
        id: String(n.id ?? n.url ?? n.headline),
        headline: n.headline ?? "",
        source: n.source ?? "",
        url: n.url ?? "",
        datetime: n.datetime ? new Date(n.datetime * 1000).toISOString() : "",
        summary: n.summary,
      }));
  } catch {
    return [];
  }
}

export async function fetchNextEarnings(symbolRaw: string): Promise<string | null> {
  if (!hasFinnhubKey()) return null;
  const symbol = symbolRaw.trim().toUpperCase().replace(/-/g, ".");
  const to = isoDateDaysAgo(-180); // 180 days forward
  const from = isoDateDaysAgo(0);
  const url = `${BASE}/calendar/earnings?from=${from}&to=${to}&symbol=${encodeURIComponent(symbol)}&token=${key()}`;
  try {
    const res = await fetch(url, { next: { revalidate: 21600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { earningsCalendar?: Array<{ date?: string; symbol?: string }> };
    const rows = data.earningsCalendar ?? [];
    const match = rows.find((r) => (r.symbol ?? "").toUpperCase() === symbol);
    if (match?.date) return new Date(match.date).toISOString();
    if (rows[0]?.date) return new Date(rows[0].date).toISOString();
    return null;
  } catch {
    return null;
  }
}
