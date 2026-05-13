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
        "picks-red": "#E43D12",
        "picks-rose": "#D6536D",
        "picks-pink": "#FFA2B6",
        "picks-yellow": "#EFB11D",
        "picks-bg": "#fafaf8",
        "picks-dark": "#1a1a1a",
      },
      fontFamily: {
        pretendard: ["Pretendard", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
        bricolage: ["Bricolage Grotesk", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.06)",
        "card-md": "0 4px 20px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
