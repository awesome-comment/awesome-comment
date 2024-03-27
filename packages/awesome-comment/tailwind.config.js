import DaisyUI from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,vue}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          middle: '#090',
        },
      },
    },
  },
  plugins: [
    DaisyUI,
  ],
  daisyui: {
    themes: ['light', 'dark'],
    prefix: 'ac-',
  },
}
