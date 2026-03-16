import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        home: {
          page: "#F5F4EB",
          banner: "#E0DDD0",
          "nav-hover": "#D6D2C3",
          search: "#464644",
          "search-button": "#2A2A28",
          "search-muted": "#B9B9B4",
        },
        cream: {
          DEFAULT: "#F5F4EB",
          dark:    "#E0DDD0",
          border:  "#D4CEC5",
          card:    "#FAF7F2",
        },
        ink: {
          DEFAULT: "#2c2820",
          muted:   "#6b6459",
          faint:   "#9a9488",
          ghost:   "#C4BEB5",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans:  ["var(--font-dm)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
