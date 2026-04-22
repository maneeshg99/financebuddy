"use client";

import { useEffect, useState } from "react";
import { getWatchlist, toggleTicker } from "./Watchlist";

export default function WatchlistStar({ symbol }: { symbol: string }) {
  const [saved, setSaved] = useState<boolean | null>(null);

  useEffect(() => {
    setSaved(getWatchlist().includes(symbol.toUpperCase()));
    const onChange = () => setSaved(getWatchlist().includes(symbol.toUpperCase()));
    window.addEventListener("financebuddy:watchlist-changed", onChange);
    return () => window.removeEventListener("financebuddy:watchlist-changed", onChange);
  }, [symbol]);

  if (saved === null) {
    return <button aria-label="Save to watchlist" className="text-dim text-2xl">☆</button>;
  }

  return (
    <button
      aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
      title={saved ? "Remove from watchlist" : "Add to watchlist"}
      onClick={() => {
        const next = toggleTicker(symbol);
        setSaved(next);
      }}
      className={`text-2xl transition hover:scale-110 ${saved ? "text-warn" : "text-dim hover:text-ink"}`}
    >
      {saved ? "★" : "☆"}
    </button>
  );
}
