/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        emphasis: '500',
        heading: '600',
        display: '700',
        hero: '900',
      },
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      letterSpacing: {
        'elegant': '0.05em',
        'extra-wide': '0.2em',
        'ultra-wide': '0.3em',
        'mega-wide': '0.5em',
      },
      keyframes: {
        'leaf-float': {
          '0%, 100%': { transform: 'translateY(0) translateX(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-6px) translateX(3px) rotate(3deg)' },
        },
        'leaf-float-slow': {
          '0%, 100%': { transform: 'translateY(0) translateX(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-4px) translateX(-2px) rotate(-2deg)' },
        },
        'leaf-sway': {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        'leaf-sway-slow': {
          '0%, 100%': { transform: 'rotate(3deg)' },
          '50%': { transform: 'rotate(-3deg)' },
        },
      },
      animation: {
        'leaf-float': 'leaf-float 4s ease-in-out infinite',
        'leaf-float-slow': 'leaf-float-slow 6s ease-in-out infinite',
        'leaf-sway': 'leaf-sway 3.5s ease-in-out infinite',
        'leaf-sway-slow': 'leaf-sway-slow 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
