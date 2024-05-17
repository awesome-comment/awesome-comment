import DaisyUI from 'daisyui';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      lineHeight: {
        16: '4rem',
      },
      zIndex: {
        1: 1,
      },
    },
  },
  plugins: [
    typography,
    DaisyUI,
  ],
  daisyui: {
    themes: ['cupcake', 'dark'],
  },
}
