/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0f1117', card: '#1a1d27', hover: '#21253a' },
        accent: { DEFAULT: '#3b82f6', hover: '#2563eb' },
        border: { DEFAULT: '#2a2d3e', light: '#3a3d50' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
