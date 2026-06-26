/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hospital: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc2fc',
          400: '#36a2fa',
          500: '#0c85eb',
          600: '#0267c7',
          700: '#0352a1',
          800: '#074685',
          900: '#0c3b6e',
          950: '#08254b',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.03)',
        'premium': '0 20px 40px -15px rgba(12, 133, 235, 0.12), 0 1px 3px rgba(0, 0, 0, 0.01)',
        'glow': '0 0 15px rgba(12, 133, 235, 0.25)',
      }
    },
  },
  plugins: [],
}
