import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig(function ({ command }) {
  const isProd = command === 'build';

  return {
    define: {
      __IS_PROD__: isProd,
      __VERSION__: JSON.stringify(pkg.version),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    plugins: [
      vue(),
      dts({
        tsconfigPath: './tsconfig.app.json',
      }),
    ],
    build: {
      target: 'chrome96',
      lib: {
        entry: 'src/auth.ts',
        name: 'AwesomeAuth',
        fileName: (format) =>
          format === 'es' ? 'awesome-auth.js' : `awesome-auth.${format}.js`,
        formats: ['es', 'umd', 'iife'],
      },
      rollupOptions: {
        output: {
          banner: '// @AwesomeAuth v' + pkg.version + '\n// https://github.com/awesome-comment/awesome-comment',
        },
      },
    },
  };
});
