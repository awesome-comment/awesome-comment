import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import pkg from './package.json' assert { type: 'json' };

// https://vitejs.dev/config/
export default defineConfig(function ({ command }) {
  const isProd = command === 'build';

  return {
    define: {
      __IS_PROD__: isProd,
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
      rollupOptions: {
        output: {
          banner: '// @AwesomeComment v' + pkg.version + '\n// https://github.com/awesome-comment/awesome-comment',
        },
      }
    },
    server: {
      proxy: {
        '/api': {
          // target: 'https://comment.roudan.io',
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  };
});
