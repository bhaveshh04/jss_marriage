import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kumkum: { 50: "#FBF1F2", 100: "#F5DDE0", 200: "#E8B4BB", 500: "#A8283B", 600: "#8C1D2F", 700: "#731726", 800: "#5A111D", 900: "#3A0A13" },
        haldi: { 50: "#FDF7E6", 100: "#F9EBC0", 300: "#EBC463", 500: "#D9A21B", 600: "#B88512", 700: "#8F650D" },
        mehendi: { 500: "#4C6B45", 600: "#3E5B3A", 700: "#2F4630" },
        ink: "#241B18",
        stone2: "#F6F3EF",
      },
      fontFamily: {
        sans: ["var(--font-ui)", "system-ui", "sans-serif"],
        marathi: ["var(--font-marathi)", "var(--font-marathi-head)", "sans-serif"],
        marathiHead: ["var(--font-marathi-head)", "var(--font-marathi)", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(58,10,19,.06), 0 6px 20px -8px rgba(58,10,19,.14)",
      },
    },
  },
  plugins: [],
};
export default config;
