"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [v, setV] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const symbol = v.trim().toUpperCase().replace(/\./g, "-");
    if (!symbol) return;
    router.push(`/${encodeURIComponent(symbol)}`);
  }

  return (
    <form onSubmit={submit} className={compact ? "w-full" : "w-full"}>
      <div className={`flex items-center gap-2 ${compact ? "" : "border border-border bg-panel rounded-md px-4 py-3"}`}>
        <input
          aria-label="Ticker search"
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder={compact ? "Ticker…" : "Enter a ticker — AAPL, MSFT, NVDA…"}
          className={`flex-1 bg-${compact ? "panel" : "transparent"} text-ink placeholder-dim outline-none font-mono ${
            compact ? "px-3 py-2 text-sm rounded-md border border-border" : "text-lg"
          }`}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
        <button
          type="submit"
          className={`rounded-md font-medium ${
            compact
              ? "bg-accent text-bg px-3 py-2 text-sm hover:brightness-110"
              : "bg-accent text-bg px-5 py-2 text-sm hover:brightness-110"
          }`}
        >
          Go
        </button>
      </div>
    </form>
  );
}
