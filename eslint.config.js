import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import vueTypeScript from '@vue/eslint-config-typescript';

export default [
  // Ignore patterns
  {
    ignores: [
      'node_modules',
      'dist',
      '**/.nuxt',
      '**/dist',
      '**/node_modules',
      '**/.vercel'
    ],
  },
  // Base JavaScript config
  js.configs.recommended,
  // Vue recommended config for Vue 3
  ...vue.configs[ 'flat/recommended' ],
  // Vue TypeScript config
  ...vueTypeScript(),
  // Custom configuration for all files
  {
    files: ['**/*.js', '**/*.vue', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        // Browser globals
        window: true,
        document: true,
        navigator: true,
        console: true,
        // Node.js globals
        process: true,
        __dirname: true,
        __filename: true,
        module: true,
        require: true,
        fetch: true,
        // ES2022 globals
        globalThis: true,
        // Vue globals
        withDefaults: true,
        defineProps: true,
        defineEmits: true,
        defineExpose: true,
        // Custom globals
        __IS_PROD__: true,
        __API_URL__: true,
        __VERSION__: true,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      vue,
    },
    rules: {
      'quotes': ['error', 'single'],
      'object-curly-spacing': ['error', 'always'],
      'computed-property-spacing': ['error', 'always'],
      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/no-empty-object-type': 0,
      '@typescript-eslint/triple-slash-reference': 0,
      '@typescript-eslint/no-unused-expressions': 0,
    },
  },
  // Override for layout Vue files
  {
    files: ['**/layouts/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
];
