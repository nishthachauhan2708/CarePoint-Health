/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        healthcare: {
          teal: {
            50: '#F0FDFA',
            100: '#CCFBF1',
            500: '#14B8A6',
            600: '#0D9488',
            700: '#0F766E',
            800: '#115E59'
          },
          navy: {
            800: '#1E293B',
            900: '#0F172A'
          },
          mint: '#2DD4BF',
          canvas: '#F8FAFC'
        }
      }
    },
  },
  plugins: [],
}
