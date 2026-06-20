/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf2f2",
          100: "#fce3e3",
          200: "#facaca",
          300: "#f6a6a6",
          400: "#f17a7a",
          500: "#EA7B7B", // User's requested primary
          600: "#d65555",
          700: "#b54040",
          800: "#963737",
          900: "#7e3232",
        },
        ink: {
          50: "#F8FAFC",  // User's requested Background
          100: "#F1F5F9",
          200: "#E2E8F0", // User's requested Border
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B", // User's requested Dark Text
          900: "#1E293B", // Mapping 900 to 800 so existing code uses the correct Dark Text
        },
        success: "#22C55E",
        warning: "#F59E0B",
        info: "#3B82F6",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(30, 41, 59, 0.04)",
        glass: "0 8px 32px 0 rgba(234, 123, 123, 0.07)",
        glow: "0 0 20px rgba(234, 123, 123, 0.4)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(234, 123, 123, 0.2)' },
          '50%': { opacity: '.7', boxShadow: '0 0 30px rgba(234, 123, 123, 0.6)' },
        }
      }
    },
  },
  plugins: [],
};
