/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1e2235', // Sidebar dark background
          darker: '#16192b',
          blue: '#2b5a9b',
          light: '#f4f7fb', // Main app background
          textMain: '#334155', // Slate 700
          textMuted: '#94a3b8', // Slate 400
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

