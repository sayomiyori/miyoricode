import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1a1d23",
        splat: {
          green: "#3ecf8e",
          blue: "#4c6ef5",
          pink: "#ff6ec7",
          orange: "#ff9f43",
        },
      },
      fontFamily: {
        display: [
          "var(--font-montreal)",
          "var(--font-cyrillic)",
          "system-ui",
          "sans-serif",
        ],
        body: [
          "var(--font-montreal)",
          "var(--font-cyrillic)",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
