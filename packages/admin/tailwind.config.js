import DaisyUI from 'daisyui';
import themes from 'daisyui/src/theming/themes';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [
    typography,
    DaisyUI,
  ],
  daisyui: {
    themes: ['light', 'dark'],
  },
}
