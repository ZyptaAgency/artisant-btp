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
        void: "#03010a",
        deep: "#0d0521",
        "nova-core": "#ff6b35",
        "nova-mid": "#c84bff",
        "nova-outer": "#ff2d8f",
        "nova-glow": "#7b2fff",
        "nova-ice": "#00d4ff",
        accent: "var(--accent)",
        "accent-secondary": "var(--accent-secondary)",
        "accent-rose": "var(--accent-rose)",
        "text-white": "var(--text-white)",
        "text-muted": "var(--text-muted)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        zypta: "12px",
        "zypta-lg": "16px",
        "zypta-xl": "20px",
      },
      boxShadow: {
        zypta: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.08)",
        "zypta-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
        "glow-accent": "0 0 30px rgba(200, 75, 255, 0.25), 0 0 60px rgba(200, 75, 255, 0.15)",
        "glow-rose": "0 0 30px rgba(255, 45, 143, 0.25), 0 0 60px rgba(255, 45, 143, 0.15)",
        "glow-ice": "0 0 30px rgba(0, 212, 255, 0.2), 0 0 60px rgba(0, 212, 255, 0.1)",
        "glow-red": "0 0 20px rgba(239, 68, 68, 0.2), 0 0 40px rgba(239, 68, 68, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
