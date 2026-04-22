"use client";

import { useEffect, useState } from "react";

export type Theme = "default" | "redesign" | "brutal" | "taste";
const STORAGE_KEY = "fb:theme";
const ORDER: Theme[] = ["brutal", "redesign", "taste", "default"];

function sanitize(v: string | null): Theme {
  return v === "default" || v === "redesign" || v === "taste" ? v : "brutal";
}

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.remove("theme-default", "theme-redesign", "theme-brutal", "theme-taste");
  html.classList.add(`theme-${t}`);
}

const LABEL: Record<Theme, string> = {
  brutal: "[ TERMINAL ]",
  redesign: "/ REDESIGN",
  taste: "· TASTE",
  default: "// DEFAULT",
};

const TITLE: Record<Theme, string> = {
  brutal: "Switch to redesign theme",
  redesign: "Switch to taste theme",
  taste: "Switch to default theme",
  default: "Switch back to terminal theme",
};

export default function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const saved = sanitize(localStorage.getItem(STORAGE_KEY));
    setTheme(saved);
    applyTheme(saved);
  }, []);

  function cycle() {
    const current = theme ?? "default";
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
