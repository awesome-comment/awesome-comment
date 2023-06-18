import DaisyUI from 'daisyui';
import themes from 'daisyui/src/theming/themes';
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
    themes: [
      {
        light: {
          ...themes[ '[data-theme=light]' ],
          primary: '#1FA7B0',
        },
      },
    ],
  },
}
