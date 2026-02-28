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
        "nova-core": "rgb(var(--accent-secondary-rgb) / <alpha-value>)",
        "nova-mid": "rgb(var(--accent-rgb) / <alpha-value>)",
        "nova-outer": "rgb(var(--accent-rose-rgb) / <alpha-value>)",
        "nova-glow": "var(--accent-glow)",
        "nova-ice": "rgb(var(--accent-ice-rgb) / <alpha-value>)",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        "accent-secondary": "rgb(var(--accent-secondary-rgb) / <alpha-value>)",
        "accent-rose": "rgb(var(--accent-rose-rgb) / <alpha-value>)",
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
        "glow-accent": "0 0 30px var(--accent-glow), 0 0 60px var(--accent-glow)",
        "glow-rose": "0 0 30px var(--ring), 0 0 60px var(--ring)",
        "glow-ice": "0 0 30px var(--accent-glow), 0 0 60px var(--accent-glow)",
        "glow-red": "0 0 20px rgba(239, 68, 68, 0.2), 0 0 40px rgba(239, 68, 68, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
