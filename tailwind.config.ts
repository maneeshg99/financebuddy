import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0e14",
        panel: "#0f1620",
        panel2: "#141c28",
        border: "#1f2937",
        ink: "#e5e7eb",
        muted: "#9ca3af",
        dim: "#6b7280",
        up: "#22c55e",
        down: "#ef4444",
        warn: "#facc15",
        accent: "#7dd3fc",
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
