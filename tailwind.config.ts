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
        nature: {
          50: "#f2f9f5",
          100: "#e1f2e7",
          200: "#c4e5d1",
          300: "#98d2b2",
          400: "#64b78e",
          500: "#3d9b6e",
          600: "#2d7c56",
          700: "#266346",
          800: "#214f39",
          900: "#1d4231",
          950: "#0e241b",
        },
        sage: {
          50: "#f6f7f4",
          100: "#e9ebe4",
          200: "#d3d7c9",
          300: "#b5bca8",
          400: "#939c82",
          500: "#768065",
          600: "#5c654e",
          700: "#49503e",
          800: "#3c4134",
          900: "#34382d",
        },
        moss: "#4a7c59",
        forest: "#1b4332",
        leaf: "#52b788",
        mint: "#74c69d",
        sand: "#fefae0",
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
