import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import pkg from './package.json' assert { type: 'json' };

// https://vitejs.dev/config/
export default defineConfig(function ({ command }) {
  const isProd = command === 'build';
  const apiUrl = isProd
    ? 'https://comment.roudan.io/'
    : 'http://localhost:3000';

  return {
    define: {
      __IS_PROD__: isProd,
      __API_URL__: JSON.stringify(apiUrl),
      __VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [vue()],
    build: {
      lib: {
        entry: 'src/main.ts',
        name: 'AwesomeComment',
        formats: ['es', 'umd'],
      },
    },
  };
});
