"use client";

import { useEffect, useState } from "react";

export type Theme = "default" | "brutal";
const STORAGE_KEY = "fb:theme";

function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.remove("theme-default", "theme-brutal");
  html.classList.add(`theme-${t}`);
}

export default function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "default";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  function toggle() {
    const next: Theme = theme === "brutal" ? "default" : "brutal";
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore quota
    }
    applyTheme(next);
  }

  const label =
    theme === null ? "…" : theme === "brutal" ? "[ TERMINAL ]" : "// DEFAULT";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle visual theme"
      title={theme === "brutal" ? "Switch to default theme" : "Switch to brutalist terminal theme"}
      className="fb-theme-switch font-mono text-xs uppercase tracking-wider border border-border px-2.5 py-1.5 text-muted hover:text-ink hover:border-accent/60 transition whitespace-nowrap"
    >
      {label}
    </button>
  );
}
