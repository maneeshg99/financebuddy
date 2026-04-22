"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "financebuddy:watchlist:v1";
const EVENT = "financebuddy:watchlist-changed";

export function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string");
    return [];
  } catch {
    return [];
  }
}

export function setWatchlist(list: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: list }));
  } catch {
    // ignore quota errors
  }
}

export function toggleTicker(symbol: string): boolean {
  const s = symbol.trim().toUpperCase();
  const list = getWatchlist();
  const idx = list.indexOf(s);
  if (idx >= 0) {
    list.splice(idx, 1);
    setWatchlist(list);
    return false;
  }
  list.push(s);
  setWatchlist(list);
  return true;
}

export default function Watchlist() {
  const [list, setList] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setList(getWatchlist());
    setReady(true);
    const onChange = () => setList(getWatchlist());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  if (!ready) {
    return (
      <div className="rounded-md border border-border bg-panel p-4">
        <div className="text-muted text-xs uppercase tracking-wider">Watchlist</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-panel p-4">
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-muted text-xs uppercase tracking-wider">
          <span className="fb-brutal-only text-dim">[ </span>
          <span className="fb-default-only">Watchlist</span>
          <span className="fb-brutal-only">WATCHLIST /// LOCAL</span>
          <span className="fb-brutal-only text-dim"> ]</span>
        </div>
        <div className="text-dim text-xs">
          <span className="fb-default-only">{list.length} saved</span>
          <span className="fb-brutal-only font-mono">N={String(list.length).padStart(3, "0")}</span>
        </div>
      </div>
      {list.length === 0 ? (
        <div className="text-muted text-sm">
          No tickers saved yet. Visit a ticker page and click the ☆ to save it.
        </div>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {list.map((sym) => (
            <li key={sym}>
              <Link
                href={`/${encodeURIComponent(sym)}`}
                className="inline-block rounded-md border border-border bg-panel2 hover:border-accent hover:text-accent font-mono text-sm px-3 py-1.5 text-ink transition"
              >
                {sym}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
