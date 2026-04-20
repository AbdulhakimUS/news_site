/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2f8', 100: '#d5e0ef', 200: '#adc1df', 300: '#85a2cf',
          400: '#5d83bf', 500: '#3564af', 600: '#2a508c', 700: '#1f3c69',
          800: '#152846', 900: '#1a2b48', 950: '#0d1624',
        },
        gold: {
          300: '#e8d5a0', 400: '#d9c07a', 500: '#c5a059', 600: '#b08040',
          700: '#8a6030', 800: '#6a4820', 900: '#4a3010',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
