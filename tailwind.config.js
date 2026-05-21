/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        'deep-charcoal': '#0f1419',
        'navy-charcoal': '#1a2332',
        'slate-panel': '#232f3e',
        'teal-accent': '#00d4aa',
        'purple-accent': '#7c5cff',
        'success-green': '#22c55e',
        'warning-amber': '#f59e0b',
        'error-red': '#ef4444',
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        'border-slate': '#334155',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'progress': 'progress 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 212, 170, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 212, 170, 0.8)' },
        },
        progress: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}