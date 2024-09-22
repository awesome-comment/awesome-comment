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
      container: {
        screens: {
          '3xl': '1880px',
        },
        padding: {
          '3xl': '1rem',
        },
      },
      lineHeight: {
        16: '4rem',
      },
      padding: {
        full: '100%',
      },
      spacing: {
        '60svh': '60svh',
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
