/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: { brand: "#046A38" },
        demerald: "#013220",
        gold: "#D4AF37",
        mustard: "#F2C94C",
        ink: "#111827",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(4,106,56,0.55)",
        goldglow: "0 0 24px rgba(212,175,55,0.45)",
      },
      keyframes: {
        moveGrad: {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        pulseGlow: {
          "0%,100%": { filter: "drop-shadow(0 0 6px rgba(212,175,55,0.5))" },
          "50%": { filter: "drop-shadow(0 0 18px rgba(212,175,55,0.95))" },
        },
      },
      animation: {
        moveGrad: "moveGrad 12s ease infinite",
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
