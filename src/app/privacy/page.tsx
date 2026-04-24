import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy · FinanceBuddy",
  description: "FinanceBuddy privacy policy.",
};

export default function PrivacyPage() {
  return (
    <article className="rounded-md border border-border bg-panel p-6 max-w-3xl mx-auto">
      <div className="text-muted text-xs uppercase tracking-wider mb-4">PRIVACY /// POL-01</div>
      <h1 className="text-2xl text-ink mb-6">Privacy Policy</h1>

      <div className="space-y-5 text-sm text-muted leading-relaxed">
        <p className="text-dim text-xs">Last updated: 2026-04-23.</p>

        <section>
          <h2 className="text-ink text-base mb-2">Who we are</h2>
          <p>
            FinanceBuddy is a personal-use financial research tool. We do not sell or commercialize
            data, and we do not require an account to use the site.
          </p>
        </section>

        <section>
          <h2 className="text-ink text-base mb-2">What we store on your device</h2>
          <p>
            Your watchlist and theme preference are stored in your browser&rsquo;s <code className="font-mono text-accent">localStorage</code>.
            These values never leave your device and can be cleared by clearing site data in your browser.
          </p>
        </section>

        <section>
          <h2 className="text-ink text-base mb-2">What we send to third parties</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              The ticker symbol you enter is sent to Yahoo Finance (via the yahoo-finance2
              library) to retrieve quotes and fundamentals.
            </li>
            <li>
              The ticker symbol is sent to Finnhub to retrieve news headlines and upcoming earnings
              dates when those features are enabled.
            </li>
            <li>
              Aggregated, anonymized page-view data is collected by Vercel Analytics (no cookies,
              no personally identifiable information).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-ink text-base mb-2">What we do not do</h2>
          <p>
            We do not set advertising cookies. We do not track you across other sites. We do not
            share data with data brokers.
          </p>
        </section>

        <section>
          <h2 className="text-ink text-base mb-2">Contact</h2>
          <p>
            Questions? Open an issue at the repository linked in the footer.
          </p>
        </section>
      </div>
    </article>
  );
}
