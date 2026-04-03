/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sidebar: "#0f2a1f",
        primary: {
          DEFAULT: "#16a34a",
          light: "rgba(34,197,94,0.14)",
          border: "rgba(34,197,94,0.35)",
        },
      },
    },
  },
  plugins: [],
};
