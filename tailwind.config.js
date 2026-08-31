/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'estudo-dark': '#0a2540',
        'estudo-bg': '#f1f5f9',
        'estudo-accent': '#facc15'
      }
    },
  },
  plugins: [],
}