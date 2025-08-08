import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "diag-lines": "url(/images/diag-lines.svg)",
        "plug-corner-rect": "url(/images/plug-corner-rect.svg)",
      },
      fontFamily: {
        "sh-serif": ["SourceHanSerif", "sans-serif"],
        "bender": ["Bender"],
        "sh-sans": ["SourceHanSans"],
        "neon": ["MonaspaceNeon"],
      },
      colors: {
        "warn": "#ffff00",
        "dark-0": "#f5f5f5",
        "light-0": "#171717",
        "dark-1": "#404040",
        "light-1": "#e5e5e5",
        "light-dark-neutral": "#737373",
        "accent-0": "#12aa9c",
        "accent-1": "#f75443"
      },
    },
  },
  plugins: [],
  darkMode: "class",
} satisfies Config;
