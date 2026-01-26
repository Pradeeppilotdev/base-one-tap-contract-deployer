/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fade-in 0.3s ease-in',
        'fade-out': 'fade-out 0.5s ease-out forwards',
      },
      keyframes: {
        'fade-in': {
          'from': { 'opacity': '0', 'transform': 'translateY(-10px)' },
          'to': { 'opacity': '1', 'transform': 'translateY(0)' },
        },
        'fade-out': {
          'from': { 'opacity': '1', 'transform': 'translateY(0)' },
          'to': { 'opacity': '0', 'transform': 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}


