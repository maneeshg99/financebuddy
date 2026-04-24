"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function TickerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[financebuddy] ticker page error:", error);
  }, [error]);

  return (
    <div className="rounded-md border border-border bg-panel p-10 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-dim mb-6">
        {"/// RUNTIME ERROR /// RETRY AVAILABLE"}
      </div>
      <div className="font-mono text-5xl text-down mb-4">ERR</div>
      <div className="text-ink text-lg mb-2">Something went sideways loading that ticker.</div>
      <div className="text-muted text-sm max-w-md mx-auto mb-6">
        {error.digest ? (
          <>
            Incident reference: <span className="font-mono text-accent">{error.digest}</span>
          </>
        ) : (
          "The page hit an unexpected error. Try again, or head back to search for a different ticker."
        )}
      </div>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={reset}
          className="inline-block rounded-md border border-border bg-panel font-mono text-sm px-4 py-2 text-muted hover:border-accent hover:text-accent transition"
        >
          {"<GO> RETRY"}
        </button>
        <Link
          href="/"
          className="inline-block rounded-md border border-border bg-panel font-mono text-sm px-4 py-2 text-muted hover:border-accent hover:text-accent transition"
        >
          {"<MENU> HOME"}
        </Link>
      </div>
    </div>
  );
}
