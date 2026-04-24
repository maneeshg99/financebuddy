import Link from "next/link";

export const TAB_KEYS = ["score", "value", "financials", "analysis", "news"] as const;
export type TabKey = (typeof TAB_KEYS)[number];

export function parseTab(raw: string | string[] | undefined): TabKey {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return "score";
  const lower = value.toLowerCase();
  return (TAB_KEYS as readonly string[]).includes(lower) ? (lower as TabKey) : "score";
}

const LABELS: Record<TabKey, string> = {
  score: "SCORE",
  value: "VALUE",
  financials: "FINANCIALS",
  analysis: "ANALYSIS",
  news: "NEWS",
};

export default function TabNav({
  current,
  symbol,
}: {
  current: TabKey;
  symbol: string;
}) {
  return (
    <nav
      aria-label="Panel tabs"
      className="rounded-md border border-border bg-panel flex overflow-x-auto"
    >
      {TAB_KEYS.map((key, i) => {
        const active = key === current;
        const base =
          "flex-1 min-w-max px-4 py-2.5 font-mono text-xs uppercase tracking-wider border-r border-border last:border-r-0 transition text-center";
        const state = active
          ? "bg-accent text-bg font-semibold"
          : "text-accent hover:bg-panel2";
        return (
          <Link
            key={key}
            href={`/${encodeURIComponent(symbol)}?t=${key}`}
            scroll={false}
            className={`${base} ${state}`}
            aria-current={active ? "page" : undefined}
          >
            <span className={active ? "text-bg/70 mr-1.5" : "text-dim mr-1.5"}>
              {`<${i + 1}>`}
            </span>
            {LABELS[key]}
          </Link>
        );
      })}
    </nav>
  );
}
