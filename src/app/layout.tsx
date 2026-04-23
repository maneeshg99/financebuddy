import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "FinanceBuddy",
  description: "Single-ticker dashboard with a composite 0-100 score, fair value band, and catalysts.",
};

const NO_FLASH_SCRIPT = `(() => {
  try {
    var t = localStorage.getItem("fb:theme");
    if (t !== "default" && t !== "redesign" && t !== "taste" && t !== "bloomberg") t = "brutal";
    document.documentElement.classList.add("theme-" + t);
  } catch (e) {
    document.documentElement.classList.add("theme-brutal");
  }
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="theme-brutal">
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-bg text-ink">
        <div className="fb-scanlines" aria-hidden="true" />
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="max-w-6xl mx-auto px-4 py-8 text-xs text-dim">
          <div className="fb-brutal-only font-mono uppercase tracking-wider mb-2 text-dim">
            {"[ END OF TRANSMISSION ]   /// REV 0.1   /// UNIT FB-01   /// © 2026"}
          </div>
          <div className="fb-bloomberg-only font-mono uppercase tracking-wider mb-2 text-dim">
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
