import Link from "next/link";
import SearchBar from "./SearchBar";
import ThemeSwitch from "./ThemeSwitch";

export default function Header() {
  return (
    <header className="fb-header border-b border-border bg-bg/90 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-dim hidden md:inline">
            [ FB-01 ]
          </span>
          <span className="text-accent font-mono text-sm tracking-wider">FB</span>
          <span className="text-ink text-sm font-semibold">FinanceBuddy</span>
        </Link>
        <div className="flex-1 max-w-md">
          <SearchBar compact />
        </div>
        <ThemeSwitch />
      </div>
      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-1 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-wider overflow-hidden">
          <span className="truncate text-dim">
            <span className="text-accent">{"<HELP>"}</span>
            {" HELP    "}
            <span className="text-accent">{"<MENU>"}</span>
            {" FAVS    "}
            <span className="text-accent">{"<GO>"}</span>
            {" LOAD"}
          </span>
          <span className="whitespace-nowrap hidden md:inline text-dim">
            {"FB-01 "}
            <span className="text-accent">{"<EQUITY>"}</span>
            {" "}
            <span className="text-accent">{"<GO>"}</span>
          </span>
          <span className="whitespace-nowrap text-dim">LIVE</span>
        </div>
      </div>
    </header>
  );
}
