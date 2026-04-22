import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "FinanceBuddy",
  description: "Single-ticker dashboard with a composite 0-100 score, fair value band, and catalysts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-ink">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="max-w-6xl mx-auto px-4 py-8 text-xs text-dim">
          Data: Yahoo Finance (via yahoo-finance2) · News: Finnhub · For personal research use. Not investment advice.
        </footer>
      </body>
    </html>
  );
}
