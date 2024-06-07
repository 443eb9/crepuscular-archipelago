import { nextui } from '@nextui-org/theme';
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/[object Object].js"
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
      },
    },
  },
  plugins: [
    nextui(),
    require("@tailwindcss/typography"),
  ],
  darkMode: "class",
};
export default config;
