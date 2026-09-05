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
          primary: '#080808',
          secondary: '#121110',
          card: '#171513',
          input: '#100E0D',
        },
        border: {
          amber: '#4F3E1B',
          gold: '#4F3E1B',
          subtle: 'rgba(212, 175, 55, 0.22)',
        },
        gold: {
          primary: '#D4AF37',
          DEFAULT: '#D4AF37',
          bright: '#F5C842',
          cream: '#F7F4EB',
        },
        amber: {
          primary: '#D4AF37',
          DEFAULT: '#D4AF37',
          bright: '#F5C842',
          glow: 'rgba(212, 175, 55, 0.25)',
        },
        heat: {
          yellow: '#F5C842',
          orange: '#E58E26',
          coral: '#DC2626',
        },
        text: {
          primary: '#F7F4EB',
          secondary: '#A39C8E',
          muted: '#6B6457',
        },
        risk: {
          low: '#22C55E',
          moderate: '#F5C842',
          high: '#E58E26',
          veryhigh: '#DC2626',
          extreme: '#9333EA',
        },
        // Fallback backward compatible colors
        dark: {
          950: '#080808',
          900: '#121110',
          850: '#171513',
          800: '#23201C',
          700: '#3A342B',
        },
        cream: {
          50:  '#F7F4EB',
          100: '#EBE5D8',
          200: '#F5C842',
          300: '#D4AF37',
          400: '#E58E26',
          500: '#DC2626',
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
