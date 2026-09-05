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
        bg: {
          primary: '#0A080F',
          secondary: '#110D1A',
          card: '#160F22',
          input: '#0E0918',
        },
        border: {
          violet: '#3B2D5A',
          gold: '#3B2D5A',
          subtle: 'rgba(167, 139, 250, 0.22)',
        },
        violet: {
          primary: '#7C3AED',
          DEFAULT: '#7C3AED',
          bright: '#A78BFA',
          soft: '#C4B5FD',
          glow: 'rgba(124, 58, 237, 0.3)',
        },
        lavender: {
          primary: '#A78BFA',
          DEFAULT: '#A78BFA',
          bright: '#C4B5FD',
          soft: '#EDE9FF',
        },
        heat: {
          yellow: '#A78BFA',
          orange: '#E58E26',
          coral: '#DC2626',
        },
        text: {
          primary: '#EDE9FF',
          secondary: '#A094C0',
          muted: '#6B5F8A',
        },
        risk: {
          low: '#22C55E',
          moderate: '#A78BFA',
          high: '#E58E26',
          veryhigh: '#DC2626',
          extreme: '#9333EA',
        },
        // Backward compatible
        dark: {
          950: '#0A080F',
          900: '#110D1A',
          850: '#160F22',
          800: '#1E1630',
          700: '#2E2448',
        },
        cream: {
          50:  '#EDE9FF',
          100: '#DDD6FE',
          200: '#C4B5FD',
          300: '#A78BFA',
          400: '#7C3AED',
          500: '#9333EA',
        }
      },
      fontFamily: {
        mono: ['NDot', 'JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        hero: '20px',
        card: '16px',
        btn: '10px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
