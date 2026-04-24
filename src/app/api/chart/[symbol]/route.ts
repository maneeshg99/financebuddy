import { NextRequest, NextResponse } from "next/server";
import { fetchChart } from "@/lib/yahoo";

type Range = "1M" | "3M" | "1Y" | "5Y";
const VALID: Range[] = ["1M", "3M", "1Y", "5Y"];

// Tickers are 1-6 alphanumeric chars, optionally with a single "-" share-class suffix
// (BRK-B) or a single "." suffix used by some exchanges (TOY.T, BP.L) — max 10 chars overall.
const TICKER_RE = /^[A-Z0-9]{1,6}(?:[-.][A-Z0-9]{1,4})?$/;

export async function GET(
  req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const raw = decodeURIComponent(params.symbol).trim().toUpperCase();
  if (!TICKER_RE.test(raw)) {
    return NextResponse.json(
      { error: "Invalid ticker format" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const rangeParam = req.nextUrl.searchParams.get("range");
  const range: Range = (VALID as string[]).includes(rangeParam ?? "")
    ? (rangeParam as Range)
    : "1Y";

  try {
    const data = await fetchChart(raw, range);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load chart" },
      { status: 500 }
    );
  }
}
