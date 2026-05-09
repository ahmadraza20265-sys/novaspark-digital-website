import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#03050d",
        ink: "#080b16",
        electric: "#12c8ff",
        ember: "#ff7a18",
        flare: "#ffbf38"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-space)", "Inter", "sans-serif"]
      },
      boxShadow: {
        "blue-glow": "0 0 36px rgba(18, 200, 255, 0.28)",
        "orange-glow": "0 0 36px rgba(255, 122, 24, 0.28)",
        "panel": "0 24px 90px rgba(0, 0, 0, 0.45)"
      },
      backgroundImage: {
        "radial-grid":
          "radial-gradient(circle at center, rgba(18, 200, 255, 0.14), transparent 42%)"
      }
    }
  },
  plugins: []
};

export default config;
