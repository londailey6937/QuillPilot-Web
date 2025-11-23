import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f8f7ff',
          100: '#f0eeff',
          200: '#e0deff',
          300: '#c7b9ff',
          400: '#a78bff',
          500: '#667eea',
          600: '#5568d3',
          700: '#4451b0',
          800: '#36408f',
          900: '#2e3573',
        },
        secondary: {
          50: '#f5fbff',
          100: '#e0f2ff',
          200: '#bae6ff',
          300: '#7dd3ff',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 10px 30px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(102, 126, 234, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
