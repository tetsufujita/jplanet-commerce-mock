import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        jp: ["var(--font-jp)", "ui-sans-serif", "system-ui"],
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
            filter: "blur(4px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
            filter: "blur(0)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "line-draw": {
          "0%": { strokeDashoffset: "var(--path-length, 400)" },
          "100%": { strokeDashoffset: "0" },
        },
        "arc-draw": {
          "0%": { strokeDashoffset: "var(--arc-length, 800)" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "line-draw": "line-draw 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards",
        "arc-draw": "arc-draw 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards",
      },
    },
  },
} satisfies Config;

export default config;
