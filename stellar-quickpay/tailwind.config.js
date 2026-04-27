/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Obsidian backgrounds ──────────────────────────────
        obsidian: {
          950: '#0B0B0B',  // page bg
          900: '#0F0F0F',  // header bg
          800: '#161616',  // card surface   ← spec value
          700: '#1C1C1C',  // secondary card / input bg  ← spec value
          600: '#242424',  // hover surface
          500: '#2E2E2E',  // divider / border base
        },
        // ── Gold — primary actions & accents ─────────────────
        gold: {
          300: '#F5E070',  // lightest highlight
          400: '#E8C84A',  // hover
          500: '#D4AF37',  // primary  ← spec value
          600: '#B8860B',  // gradient end / active  ← spec value
          700: '#9A6F08',  // deep pressed
        },
        // ── Silver — typography & borders ────────────────────
        silver: {
          100: '#F5F5F5',
          200: '#E5E4E2',  // headings / primary text  ← spec value
          300: '#C8C7C5',  // secondary text
          400: '#A0A0A0',  // muted text  ← spec value
          500: '#787878',  // placeholder
          600: '#505050',  // subtle border
          700: '#383838',  // strong border
        },
        // ── Semantic ──────────────────────────────────────────
        success: {
          400: '#34D399',
          500: '#10B981',
          900: '#052E1C',
        },
        crimson: {
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          900: '#3B0A0A',
        },
      },

      backgroundImage: {
        // Spec: radial gradient page background
        'obsidian-radial':
          'radial-gradient(ellipse at 50% 0%, #1C1C1C 0%, #0B0B0B 65%)',
        // Spec: linear gradient for primary buttons
        'gold-gradient':
          'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
        'gold-gradient-hover':
          'linear-gradient(135deg, #E8C84A 0%, #D4AF37 100%)',
      },

      boxShadow: {
        // Spec: button lift shadow
        'gold-lift':  '0 4px 20px rgba(212,175,55,0.30)',
        'gold-lift-lg':'0 6px 28px rgba(212,175,55,0.45)',
        // Card: obsidian drop + faint gold inner top edge
        'card':       '0 2px 8px rgba(0,0,0,0.7), inset 0 1px 0 rgba(229,228,226,0.04)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.08)',
      },

      animation: {
        'fade-in':    'fadeIn 0.25s ease-in-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.45' },
        },
      },
    },
  },
  plugins: [],
}
