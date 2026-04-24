import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
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
          Data: Yahoo Finance (via yahoo-finance2) · News: Finnhub · For personal research use. Not investment advice.
        </footer>
      </body>
    </html>
  );
}
