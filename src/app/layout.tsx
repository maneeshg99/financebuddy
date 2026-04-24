import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Header from "@/components/Header";
// Fire env validation at server startup.
import "@/lib/env";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://financebuddy-nine.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "FinanceBuddy",
  description: "Single-ticker dashboard with a composite 0-100 score, fair value band, and catalysts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="theme-bbg-v1">
      <body className="min-h-screen bg-bg text-ink">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="max-w-6xl mx-auto px-4 py-8 text-xs text-dim">
          <div className="font-mono uppercase tracking-wider mb-2 text-dim">
            <span className="text-accent">{"<HELP>"}</span>
            {" FOR HELP   "}
            <span className="text-accent">{"<MENU>"}</span>
            {" FOR FAVORITES   FB-01 EQUITY   © 2026 FB-TERMINAL"}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>Data: Yahoo Finance &amp; Finnhub · For personal research use. Not investment advice.</span>
            <span className="text-dim">·</span>
            <a href="/privacy" className="hover:text-accent">Privacy</a>
            <span className="text-dim">·</span>
            <a href="/terms" className="hover:text-accent">Terms</a>
            <span className="text-dim">·</span>
            <a href="/data-sources" className="hover:text-accent">Data sources</a>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
