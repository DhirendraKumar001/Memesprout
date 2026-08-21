/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Colors are CSS variables (see index.css :root / .dark) so the whole
        // app flips between light and dark instantly via one class toggle.
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        surface2: "rgb(var(--color-surface2) / <alpha-value>)",
        hairline: "rgb(var(--color-hairline) / <alpha-value>)",
        gold: {
          DEFAULT: "rgb(var(--color-gold) / <alpha-value>)",
          bright: "rgb(var(--color-gold-bright) / <alpha-value>)",
          dim: "rgb(var(--color-gold-dim) / <alpha-value>)",
        },
        ivory: {
          DEFAULT: "rgb(var(--color-ivory) / <alpha-value>)",
          dim: "rgb(var(--color-ivory-dim) / <alpha-value>)",
        },
        wine: "rgb(var(--color-wine) / <alpha-value>)",
      },
      fontFamily: {
        display: ["'Inter'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'Inter'", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.06em",
      },
      boxShadow: {
        seal: "inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.15)",
        card: "0 1px 2px rgba(0,0,0,0.05)",
      },
      backgroundImage: {
        vignette: "none",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.85 },
        },
        rise: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        flicker: "flicker 3.2s ease-in-out infinite",
        rise: "rise 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
