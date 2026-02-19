import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', '"Times New Roman"', 'serif'],
        body: ['"DM Sans"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#0B1120',
          900: '#0F1729',
          800: '#151E2F',
          700: '#1C2738',
          600: '#243044',
          500: '#2E3E56',
        },
        gold: {
          DEFAULT: '#C9A96E',
          light: '#DFC089',
          dim: '#9A7E4F',
          muted: 'rgba(201, 169, 110, 0.12)',
        },
        cream: '#F0EDE6',
      },
      borderColor: {
        'gold-subtle': 'rgba(201, 169, 110, 0.12)',
        'gold-medium': 'rgba(201, 169, 110, 0.25)',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(201, 169, 110, 0.15)',
        'gold-glow-lg': '0 0 30px rgba(201, 169, 110, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out forwards',
        'fade-in-up': 'fadeInUp 500ms ease both',
        'slide-in-left': 'slideInLeft 250ms ease-out both',
        'slide-in-right': 'slideInRight 250ms ease-out both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
