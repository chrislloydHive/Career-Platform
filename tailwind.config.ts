import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        'grow-width': {
          '0%': { width: '0%' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'glow-green': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(74, 222, 128, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(74, 222, 128, 0.4)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'grow-width': 'grow-width 0.7s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'glow-green': 'glow-green 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;