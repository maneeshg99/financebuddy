import { z } from "zod";

const schema = z.object({
  FINNHUB_API_KEY: z
    .string()
    .min(1, "FINNHUB_API_KEY must be set — /news + next-earnings will be disabled without it")
    .optional(),
  // SEC EDGAR requires a User-Agent header containing a contact email — see
  // docs/data-licensing.md and src/lib/edgar.ts. Server-only env (no
  // NEXT_PUBLIC_ prefix) so the value never reaches a browser bundle.
  EDGAR_USER_AGENT: z
    .string()
    .min(1)
    .refine((v) => v.includes("@"), {
      message:
        "EDGAR_USER_AGENT must contain a contact email (e.g. \"FinanceBuddy you@example.com\"). SEC EDGAR returns 403 without a real User-Agent and silent failures can get the deployment IP-banned.",
    })
    .optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof schema>;

function parseEnv(): Env {
  const result = schema.safeParse({
    FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
  if (!result.success) {
    const messages = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${messages}`);
  }
  return result.data;
}

export const env = parseEnv();
