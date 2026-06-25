import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0B14",
          50: "#15151F",
          100: "#1B1B28",
          200: "#23232F",
        },
        mist: {
          DEFAULT: "#EDEDF5",
          muted: "#9494AB",
          faint: "#6C6C82",
        },
        drift: {
          DEFAULT: "#7C8CFF",
          soft: "#A6B1FF",
          dim: "#4E54A6",
        },
        wake: {
          DEFAULT: "#FF8966",
          soft: "#FFB199",
        },
        glass: {
          border: "rgba(237, 237, 245, 0.08)",
          surface: "rgba(21, 21, 31, 0.55)",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jbmono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "dream-gradient":
          "radial-gradient(120% 120% at 10% 0%, rgba(124,140,255,0.18) 0%, rgba(11,11,20,0) 55%), radial-gradient(100% 100% at 90% 100%, rgba(255,137,102,0.10) 0%, rgba(11,11,20,0) 50%)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.35)",
        glow: "0 0 40px rgba(124,140,255,0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      animation: {
        drift: "drift 12s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-12px) translateX(6px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
