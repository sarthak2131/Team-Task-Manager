/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f1720",
        sand: "#f7efe2",
        ember: "#eb6b37",
        dusk: "#43334d",
        line: "#e7dccd"
      },
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"]
      },
      boxShadow: {
        panel: "0 24px 60px rgba(33, 24, 18, 0.12)"
      },
      backgroundImage: {
        shell:
          "radial-gradient(circle at top left, rgba(251, 191, 36, 0.24), transparent 22rem), radial-gradient(circle at bottom right, rgba(20, 184, 166, 0.18), transparent 28rem), linear-gradient(180deg, #fffaf2 0%, #f7efe2 48%, #f1e1c7 100%)"
      }
    }
  },
  plugins: []
};
