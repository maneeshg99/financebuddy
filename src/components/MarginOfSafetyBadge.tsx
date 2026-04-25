import type { FairValue } from "@/lib/types";
import { marginOfSafety } from "@/lib/fairvalue";
import { fmtMoney, fmtPct } from "@/lib/format";

type Tone = "strong" | "modest" | "fair" | "premium" | "expensive" | "unknown";

function classify(mos: number | null): Tone {
  if (mos === null) return "unknown";
  if (mos >= 0.2) return "strong";
  if (mos >= 0.05) return "modest";
  if (mos >= -0.05) return "fair";
  if (mos >= -0.1) return "premium";
  return "expensive";
}

const TONE_STYLE: Record<Tone, string> = {
  strong: "border-up/40 bg-up/10 text-up",
  modest: "border-up/30 bg-up/5 text-up",
  fair: "border-warn/40 bg-warn/10 text-warn",
  premium: "border-down/30 bg-down/5 text-down",
  expensive: "border-down/40 bg-down/10 text-down",
  unknown: "border-border bg-panel2 text-muted",
};

const TONE_LABEL: Record<Tone, string> = {
  strong: "Margin of Safety",
  modest: "Margin of Safety",
  fair: "Roughly fair",
  premium: "Premium to fair value",
  expensive: "Expensive vs fair value",
  unknown: "Margin of Safety",
};

export default function MarginOfSafetyBadge({
  fv,
  price,
}: {
  fv: FairValue;
  price: number | null;
}) {
  const mos = marginOfSafety(fv, price);
  const tone = classify(mos);
  const cls = TONE_STYLE[tone];
  const label = TONE_LABEL[tone];

  // Display sign + human reading. Strong/modest read as "+12% MoS"; premium /
  // expensive read as "-8% premium" (positive number framing for negative MoS).
  let valueText: string;
  if (mos === null) {
    valueText = "—";
  } else {
    const pctStr = fmtPct(Math.abs(mos), 0);
    if (mos >= 0) {
      valueText = `+${pctStr}`;
    } else {
      valueText = `−${pctStr}`;
    }
  }

  const sublabel = (() => {
    if (mos === null) return "Insufficient data — band not computable.";
    const fv_mid = fv.mid;
    if (fv_mid === null) return "No fair-value mid available.";
    const direction = mos >= 0 ? "below" : "above";
    return `Price ${fmtMoney(price)} is ${fmtPct(Math.abs(mos), 1)} ${direction} the fair-value mid of ${fmtMoney(fv_mid)}.`;
  })();

  return (
    <section
      className={`rounded-md border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 ${cls}`}
      aria-label="Margin of safety summary"
    >
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight">
          {valueText}
        </span>
        <span className="text-xs uppercase tracking-wider opacity-80">{label}</span>
      </div>
      <p className="text-xs sm:text-sm opacity-90 sm:flex-1">{sublabel}</p>
    </section>
  );
}
