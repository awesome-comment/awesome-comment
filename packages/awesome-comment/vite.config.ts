import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import pkg from './package.json' assert { type: 'json' };

// https://vitejs.dev/config/
export default defineConfig(function ({ command }) {
  const isProd = command === 'build';
  const apiUrl = 'https://comment.roudan.io';

  return {
    define: {
      __IS_PROD__: isProd,
      __API_URL__: JSON.stringify(apiUrl),
      __VERSION__: JSON.stringify(pkg.version),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    plugins: [vue()],
    build: {
      target: 'chrome96',
      lib: {
        entry: 'src/main.ts',
        name: 'AwesomeComment',
        fileName: (format) =>
          format === 'es' ? 'awesome-comment.js' : `awesome-comment.${format}.js`,
        formats: ['es', 'umd', 'iife'],
      },
    },
  };
});
