import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
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
      },
      colors: {
        // Light theme colors
        'light-bg': '#f5f5f7',
        'light-bg-secondary': '#ffffff',
        'light-bg-tertiary': '#e8e8ed',
        'light-border': '#d1d1d6',
        'light-text': '#1d1d1f',
        'light-text-secondary': '#6e6e73',
        // Dark theme colors (current)
        'dark-bg': '#0f0d1a',
        'dark-bg-secondary': '#0b0911',
        'dark-bg-tertiary': '#1a1423',
        'dark-border': '#2b2637',
        'dark-text': '#ffffff',
        'dark-text-secondary': '#a0a0a8',
        // Primary purple (works in both themes)
        'primary': '#896cef',
        'primary-hover': '#7b5dd8',
      },
    },
  },
  plugins: [],
};
export default config;
