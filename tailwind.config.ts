import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "diag-lines": "url(/images/diag-lines.svg)",
      },
      fontFamily: {
        "sh-serif": ["SourceHanSerif", "sans-serif"],
        "bender": ["Bender"],
        "sh-sans": ["SourceHanSans"],
        "krypton": ["MonaspaceKrypton"],
        "argon": ["MonaspaceArgon"],
      },
      colors: {
        "443eb9": "#443eb9",
        "warn": "#ffff00",
        // light-contrast
        "light-contrast": "#171717",
        "light-background": "#f5f5f5",
        // neutral-50
        "dark-contrast": "#fafafa",
        "dark-background": "#181818",
        "light-unfocused": "#e5e5e5",
        "dark-unfocused": "#404040",
        "light-dark-neutral": "#737373"
      },
    },
  },
  plugins: [],
};
export default config;
