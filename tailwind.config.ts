import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101725",
        mist: "#eff4f1",
        sand: "#f5f0e7",
        ember: "#db6a3b",
        sage: "#5d7a68",
        gold: "#d3aa53"
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        display: ["var(--font-cormorant)", "serif"]
      },
      boxShadow: {
        panel: "0 18px 40px rgba(16, 23, 37, 0.08)"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top, rgba(211,170,83,0.22), transparent 38%), radial-gradient(circle at 20% 20%, rgba(93,122,104,0.18), transparent 28%)"
      }
    }
  },
  plugins: []
};

export default config;
