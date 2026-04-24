import { z } from "zod";

const schema = z.object({
  FINNHUB_API_KEY: z
    .string()
    .min(1, "FINNHUB_API_KEY must be set — /news + next-earnings will be disabled without it")
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
