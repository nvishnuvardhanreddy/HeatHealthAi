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
        dark: {
          950: '#0C0A09',    // Warm near-black (stone-950)
          900: '#1C1917',    // Dark warm brown
          850: '#292524',    // Warm dark gray
          800: '#44403C',    // Stone-700 warm
          700: '#57534E',    // Stone-600
        },
        cream: {
          50:  '#FFFBEB',    // Lightest cream
          100: '#FEF3C7',    // Pale cream
          200: '#FDE68A',    // Warm cream
          300: '#FCD34D',    // Golden cream
          400: '#FBBF24',    // Amber gold
          500: '#F59E0B',    // Deep amber
        },
        heat: {
          low: '#10B981',
          moderate: '#FBBF24',
          high: '#F97316',
          veryhigh: '#EF4444',
          extreme: '#A855F7',
        },
        brand: {
          cyan: '#06B6D4',
          teal: '#14B8A6',
          sky: '#0284C7',
          amber: '#F59E0B',
          warm: '#D97706',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(251, 191, 36, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
