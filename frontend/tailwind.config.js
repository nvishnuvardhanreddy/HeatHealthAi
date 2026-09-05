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
          primary: '#0C0A09',
          secondary: '#161311',
          card: '#14110F',
          input: '#100E0D',
        },
        border: {
          amber: '#4F3100',
          subtle: 'rgba(245, 169, 0, 0.18)',
        },
        amber: {
          primary: '#F5A900',
          DEFAULT: '#F5A900',
          bright: '#FFD34D',
          glow: 'rgba(245, 169, 0, 0.25)',
        },
        heat: {
          yellow: '#FFD34D',
          orange: '#FF9F3D',
          coral: '#FF7568',
        },
        text: {
          primary: '#F5F0E8',
          secondary: '#A59F95',
          muted: '#706A62',
        },
        risk: {
          low: '#16C784',
          moderate: '#F0B400',
          high: '#FF7518',
          veryhigh: '#EF4444',
          extreme: '#7C3AED',
        },
        // Fallback backward compatible colors
        dark: {
          950: '#0C0A09',
          900: '#161311',
          850: '#14110F',
          800: '#26201B',
          700: '#38302A',
        },
        cream: {
          50:  '#FFFBEB',
          100: '#F5F0E8',
          200: '#FFD34D',
          300: '#F5A900',
          400: '#FF9F3D',
          500: '#FF7568',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
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
