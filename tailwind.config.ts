import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        odoo: {
          50: "#faf5f8",
          100: "#f4eaf1",
          200: "#edd8e6",
          300: "#e0bbd3",
          400: "#cb92b9",
          500: "#b36d9d",
          600: "#975080",
          700: "#7c3e67",
          800: "#673555",
          900: "#573049",
          950: "#381b2e",
          primary: "#714B67",
          teal: "#017E84",
          tealHover: "#006c71",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      spacing: {
        "6px": "6px",
        "12px": "12px",
        "18px": "18px",
        "24px": "24px",
        "30px": "30px",
        "36px": "36px",
        "42px": "42px",
        "48px": "48px",
        "54px": "54px",
        "60px": "60px",
        "66px": "66px",
        "72px": "72px",
        "84px": "84px",
        "96px": "96px",
        "120px": "120px",
      },
      lineHeight: {
        "12px": "12px",
        "18px": "18px",
        "24px": "24px",
        "30px": "30px",
        "36px": "36px",
        "42px": "42px",
        "48px": "48px",
      },
      letterSpacing: {
        tightest: "-0.03em",
        tighter: "-0.02em",
        tight: "-0.01em",
        normal: "0em",
        wide: "0.02em",
      },
    },
  },
  plugins: [],
};

export default config;
