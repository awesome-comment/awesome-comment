import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import pkg from './package.json' with { type: 'json' };

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
      target: 'es2022',
      outDir: 'dist',
      lib: {
        entry: 'src/main.ts',
        name: 'AwesomeComment',
        fileName: () => 'awesome-comment.js',
        formats: ['es'],
        cssFileName: 'style',
      },
      rollupOptions: {
        output: {
          banner: '// @AwesomeComment v' + pkg.version + '\n// https://github.com/awesome-comment/awesome-comment',
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('/@vue/')) return 'vendor-vue';
            if (id.includes('/vue/dist/')) return 'vendor-vue';
            if (id.includes('/pinia/')) return 'vendor-pinia';
            if (id.includes('/vue-i18n/')) return 'vendor-i18n';
            if (id.includes('/@auth0/auth0-vue/')) return 'vendor-auth0';
            if (id.includes('/marked/')) return 'vendor-marked';
            if (id.includes('/lodash-es/')) return 'vendor-lodash';
            if (id.includes('/lucide-vue-next/')) return 'vendor-lucide';
            if (id.includes('/animate.css/')) return 'vendor-animate';
            return 'vendor-misc';
          },
        },
      },
    },
  };
});
