"use client";

import { useEffect, useState } from "react";

export type Theme = "bbg-v1" | "bbg-v2";
const STORAGE_KEY = "fb:theme";
const ORDER: Theme[] = ["bbg-v1", "bbg-v2"];

function sanitize(v: string | null): Theme {
  return v === "bbg-v2" ? "bbg-v2" : "bbg-v1";
}

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.remove("theme-bbg-v1", "theme-bbg-v2");
  html.classList.add(`theme-${t}`);
}

const LABEL: Record<Theme, string> = {
  "bbg-v1": "<BBG V1>",
  "bbg-v2": "<BBG V2>",
};

const TITLE: Record<Theme, string> = {
  "bbg-v1": "Switch to BBG v2 (dense)",
  "bbg-v2": "Switch to BBG v1 (classic)",
};

export default function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const saved = sanitize(localStorage.getItem(STORAGE_KEY));
    setTheme(saved);
    applyTheme(saved);
  }, []);

  function cycle() {
    const current = theme ?? "bbg-v1";
    const idx = ORDER.indexOf(current);
    const next = ORDER[(idx + 1) % ORDER.length];
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore quota
    }
    applyTheme(next);
  }

  const label = theme === null ? "…" : LABEL[theme];
  const title = theme === null ? "Toggle visual theme" : TITLE[theme];

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label="Cycle visual theme"
      title={title}
      className="fb-theme-switch font-mono text-xs uppercase tracking-wider border border-border px-2.5 py-1.5 text-muted hover:text-ink hover:border-accent/60 transition whitespace-nowrap"
    >
      {label}
    </button>
  );
}
