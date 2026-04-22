export function safeNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  return n;
}

function isNil(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "number" && !Number.isFinite(v)) return true;
  return false;
}

export function fmtNum(v: unknown, digits = 2): string {
  if (isNil(v)) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtPct(v: unknown, digits = 2): string {
  if (isNil(v)) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `${(n * 100).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

export function fmtMoney(v: unknown, digits = 2): string {
  if (isNil(v)) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `$${n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function fmtCompact(v: unknown): string {
  if (isNil(v)) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(2)}K`;
  return `${sign}${abs.toFixed(2)}`;
}

export function fmtMoneyCompact(v: unknown): string {
  if (isNil(v)) return "—";
  const c = fmtCompact(v);
  return c === "—" ? "—" : `$${c}`;
}

export function fmtDate(v: unknown): string {
  if (isNil(v)) return "—";
  const d = typeof v === "string" || typeof v === "number" ? new Date(v) : v instanceof Date ? v : null;
  if (!d || Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function pctClass(v: unknown): string {
  if (isNil(v)) return "text-muted";
  const n = Number(v);
  if (!Number.isFinite(n)) return "text-muted";
  if (n > 0) return "text-up";
  if (n < 0) return "text-down";
  return "text-muted";
}

export function scoreClass(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) return "text-muted";
  if (score >= 70) return "text-up";
  if (score >= 45) return "text-warn";
  return "text-down";
}

export function scoreBg(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) return "bg-dim";
  if (score >= 70) return "bg-up";
  if (score >= 45) return "bg-warn";
  return "bg-down";
}
