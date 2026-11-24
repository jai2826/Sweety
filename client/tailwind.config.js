/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5ff',
          100: '#d9e8ff',
          500: '#3b7dd8',
          600: '#2f66b5',
          700: '#274f8c',
        },
      },
    },
  },
  plugins: [],
};
