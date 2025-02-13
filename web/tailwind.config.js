/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // ✅ Root HTML file
    "./src/**/*.{js,jsx,ts,tsx}",  // ✅ Scans all JSX/TSX files inside src/
    "./src/components/**/*.{js,jsx,ts,tsx}", // ✅ Scans components folder
    "./src/context/**/*.{js,jsx,ts,tsx}", // ✅ Scans context folder
    "./src/hooks/**/*.{js,jsx,ts,tsx}", // ✅ Scans hooks folder
    "./src/pages/**/*.{js,jsx,ts,tsx}", // ✅ Scans pages like Login.jsx
    "./src/styles/**/*.css" // ✅ Scans global styles in styles/ folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
