"use client";

import { useEffect, useState } from "react";
import type { Snapshot } from "@/lib/types";
import PriceChart from "./PriceChart";
import SessionStats from "./SessionStats";

const STORAGE_KEY = "fb:chart-open";

export default function ChartSection({ snap }: { snap: Snapshot }) {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setOpen(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  function toggle() {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore quota
    }
  }

  return (
    <section className="rounded-md border border-border bg-panel">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="fb-chart-body"
        className="w-full flex items-center justify-between gap-3 px-5 py-3 text-left hover:bg-panel2 transition"
      >
        <span className="text-muted text-xs uppercase tracking-wider">PRICE /// CH-01</span>
        <span className="font-mono text-xs text-accent" aria-hidden>
          {hydrated ? (open ? "[ − ]" : "[ + ]") : "[ · ]"}
        </span>
      </button>
      {open ? (
        <div id="fb-chart-body">
          <div className="border-t border-border">
            <SessionStats snap={snap} />
          </div>
          <div className="border-t border-border p-5">
            <PriceChart symbol={snap.symbol} noFrame />
          </div>
        </div>
      ) : null}
    </section>
  );
}
