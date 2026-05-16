/** @type {import('tailwindcss').Config} */

// ============================================================
// DataNest - Configuración de Tailwind CSS
// Sistema de diseño: minimalismo sofisticado con acentos índigo/emerald
// ============================================================

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Tipografía principal: Sora (geométrica, moderna)
        sans: ["var(--font-sora)", "system-ui", "sans-serif"],
        // Tipografía de código
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",  // Indigo principal
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        accent: {
          400: "#34d399",
          500: "#10b981",  // Emerald para métricas positivas
          600: "#059669",
        },
        danger: {
          400: "#f87171",
          500: "#ef4444",  // Rojo para alertas
        },
        surface: {
          0: "#ffffff",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card:   "0 1px 3px 0 rgba(0,0,0,.08), 0 1px 2px -1px rgba(0,0,0,.04)",
        "card-hover": "0 10px 30px -5px rgba(99,102,241,.15)",
        glow:   "0 0 40px rgba(99,102,241,.25)",
      },
      animation: {
        "fade-in":    "fadeIn .35s ease forwards",
        "slide-up":   "slideUp .4s ease forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "spin-slow":  "spin 3s linear infinite",
        shimmer:      "shimmer 1.8s linear infinite",
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 },                    to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        pulseSoft: { "0%,100%": { opacity: .8 },              "50%": { opacity: 1 } },
        shimmer:   { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};
