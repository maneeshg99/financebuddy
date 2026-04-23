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
    if (t !== "bbg-v2") t = "bbg-v1";
    document.documentElement.classList.add("theme-" + t);
  } catch (e) {
    document.documentElement.classList.add("theme-bbg-v1");
  }
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="theme-bbg-v1">
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-bg text-ink">
        <div className="fb-scanlines" aria-hidden="true" />
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
