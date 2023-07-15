import DaisyUI from 'daisyui';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,vue}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    typography,
    DaisyUI,
  ],
  daisyui: {
    themes: ['light', 'dark'],
    prefix: 'd-',
  },
}
