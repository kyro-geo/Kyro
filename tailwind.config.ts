import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 950: "#0b0d14", 900: "#10131c", 850: "#151925", 800: "#1a1f2d", 700: "#242a3b", 600: "#323a50" },
        mist: { 100: "#eef0f8", 300: "#b8bdd3", 400: "#9298b3", 500: "#6f7591" },
        iris: { 300: "#c3c6ff", 400: "#a5a8ff", 500: "#8286f7", 600: "#6366e8", 700: "#4d4fc4" },
        ember: { 400: "#f5a35c", 500: "#e88a3a" },
        leaf: { 400: "#5fd69a", 500: "#34c27e" },
        rose: { 400: "#f47a8a", 500: "#e85a6e" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        lift: "0 18px 40px -18px rgba(5,7,15,.85), 0 2px 6px -2px rgba(5,7,15,.6)",
        glow: "0 10px 30px -10px rgba(130,134,247,.55)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
      },
      animation: {
        shimmer: "shimmer 1.6s cubic-bezier(.16,1,.3,1) infinite",
        float: "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
