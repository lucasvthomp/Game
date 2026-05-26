import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
