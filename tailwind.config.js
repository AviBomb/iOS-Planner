/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ios: {
          bg: "#000000",
          card: "#1C1C1E",
          cardElevated: "#2C2C2E",
          separator: "#38383A",
          blue: "#0A84FF",
          green: "#30D158",
          indigo: "#5E5CE6",
          orange: "#FF9F0A",
          pink: "#FF375F",
          purple: "#BF5AF2",
          red: "#FF453A",
          teal: "#64D2FF",
          yellow: "#FFD60A",
          textPrimary: "#FFFFFF",
          textSecondary: "#8E8E93",
          textTertiary: "#48484A"
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "sans-serif"
        ]
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      }
    },
  },
  plugins: [],
}

