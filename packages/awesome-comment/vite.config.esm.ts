import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import pkg from './package.json' with { type: 'json' };

export default defineConfig(function ({ command }) {
  const isProd = command === 'build';
  const bundledDependencies = new Set(['@awesome-comment/core', '@roudanio/awesome-auth']);
  const externalDependencies = Object.keys(pkg.dependencies || {}).filter(
    (dependency) => !bundledDependencies.has(dependency),
  );

  function isExternal(id: string): boolean {
    return externalDependencies.some((dependency) => id === dependency || id.startsWith(`${dependency}/`));
  }

  return {
    define: {
      __IS_PROD__: isProd,
      __VERSION__: JSON.stringify(pkg.version),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    plugins: [vue()],
    build: {
      target: 'chrome96',
      outDir: 'dist/esm',
      lib: {
        entry: 'src/main.ts',
        name: 'AwesomeComment',
        fileName: () => 'awesome-comment.js',
        formats: ['es'],
        cssFileName: 'style',
      },
      rollupOptions: {
        external: isExternal,
        output: {
          banner: '// @AwesomeComment v' + pkg.version + '\n// https://github.com/awesome-comment/awesome-comment',
          manualChunks(id) {
            if (id.includes('node_modules')) return 'vendor';
            return undefined;
          },
        },
      },
    },
  };
});
