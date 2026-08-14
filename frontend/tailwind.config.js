/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07111f',
        ocean: '#0f5fa8',
        mint: '#6ee7b7',
        amber: '#f7c948',
      },
      boxShadow: {
        glow: '0 24px 80px rgba(15, 95, 168, 0.32)',
      },
    },
  },
  plugins: [],
};
