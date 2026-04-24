import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Content-Security-Policy — permissive enough for Next.js hydration and inline
// Recharts styles, restrictive enough to block outside script sources.
// Tighten to nonce-based CSP in Phase 1 (requires middleware-generated nonce).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://finnhub.io https://*.finnhub.io https://va.vercel-scripts.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("Content-Security-Policy", CSP);
  return res;
}

export const config = {
  // Apply to all routes except Next.js internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image).*)"],
};
