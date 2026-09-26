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
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
