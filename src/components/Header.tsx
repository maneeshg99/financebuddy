import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Header() {
  return (
    <header className="border-b border-border bg-bg/90 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-accent font-mono text-sm tracking-wider">FB</span>
          <span className="text-ink text-sm font-semibold">FinanceBuddy</span>
        </Link>
        <div className="flex-1 max-w-md">
          <SearchBar compact />
        </div>
      </div>
    </header>
  );
}
