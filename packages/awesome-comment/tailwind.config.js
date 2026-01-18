import DaisyUI from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      boxShadow: {
        'outline-md': '0 0 0 4px oklch(var(--b1))',
      },
      colors: {
        green: {
          middle: '#090',
        },
      },
    },
  },
  plugins: [DaisyUI],
  daisyui: {
    themes: ['light', 'dark'],
    prefix: 'ac-',
  },
};
