import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms · FinanceBuddy",
  description: "FinanceBuddy terms of use.",
};

export default function TermsPage() {
  return (
    <article className="rounded-md border border-border bg-panel p-6 max-w-3xl mx-auto">
      <div className="text-muted text-xs uppercase tracking-wider mb-4">TERMS /// POL-02</div>
      <h1 className="text-2xl text-ink mb-6">Terms of Use</h1>

      <div className="space-y-5 text-sm text-muted leading-relaxed">
        <p className="text-dim text-xs">Last updated: 2026-04-23.</p>

        <section>
          <h2 className="text-ink text-base mb-2">Not investment advice</h2>
          <p>
            FinanceBuddy is an educational and research tool. Nothing on this site constitutes
            investment, legal, tax, or financial advice. The composite score, fair-value band, and
            commentary are model outputs — not recommendations. Always do your own research and
            consult a licensed financial professional before making investment decisions.
          </p>
        </section>

        <section>
          <h2 className="text-ink text-base mb-2">No warranty</h2>
          <p>
            The site and its data are provided &ldquo;as is&rdquo; without warranty of any kind.
            Data accuracy, completeness, and timeliness are not guaranteed. Quotes and fundamentals
            may be delayed, incorrect, or missing.
          </p>
        </section>

        <section>
          <h2 className="text-ink text-base mb-2">Liability</h2>
          <p>
            To the maximum extent permitted by law, FinanceBuddy and its maintainers are not
            liable for any loss or damage — direct, indirect, consequential, or otherwise — arising
            from use of the site or reliance on its content.
          </p>
        </section>

        <section>
          <h2 className="text-ink text-base mb-2">Acceptable use</h2>
          <p>
            Use the site for personal research. Do not scrape at a rate that impairs service for
            others, and do not attempt to bypass rate limits.
          </p>
        </section>

        <section>
          <h2 className="text-ink text-base mb-2">Changes</h2>
          <p>
            These terms may be updated without notice. Continued use after a change constitutes
            acceptance of the updated terms.
          </p>
        </section>
      </div>
    </article>
  );
}
