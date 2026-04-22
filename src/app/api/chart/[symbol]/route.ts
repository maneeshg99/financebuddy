import { NextRequest, NextResponse } from "next/server";
import { fetchChart } from "@/lib/yahoo";

type Range = "1M" | "3M" | "1Y" | "5Y";
const VALID: Range[] = ["1M", "3M", "1Y", "5Y"];

export async function GET(
  req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const symbol = decodeURIComponent(params.symbol);
  const rangeParam = req.nextUrl.searchParams.get("range");
  const range: Range = (VALID as string[]).includes(rangeParam ?? "")
    ? (rangeParam as Range)
    : "1Y";

  try {
    const data = await fetchChart(symbol, range);
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
