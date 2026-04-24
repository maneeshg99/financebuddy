import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-md border border-border bg-panel p-10 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-dim mb-6">
        {"/// ERROR 404 /// FUNCTION NOT FOUND"}
      </div>
      <div className="font-mono text-6xl text-accent mb-4">404</div>
      <div className="text-ink text-lg mb-2">This function does not exist.</div>
      <div className="text-muted text-sm max-w-md mx-auto mb-8">
        The page you&rsquo;re looking for isn&rsquo;t on this terminal. Try a ticker instead.
      </div>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link
          href="/"
          className="inline-block rounded-md border border-border bg-panel font-mono text-sm px-4 py-2 text-muted hover:border-accent hover:text-accent transition"
        >
          {"<MENU> HOME"}
        </Link>
        <Link
          href="/AAPL"
          className="inline-block rounded-md border border-border bg-panel font-mono text-sm px-4 py-2 text-muted hover:border-accent hover:text-accent transition"
        >
          {"<GO> AAPL"}
        </Link>
      </div>
    </div>
  );
}
