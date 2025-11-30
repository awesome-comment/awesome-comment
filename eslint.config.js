import js from '@eslint/js';
import typescript from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import globals from 'globals';

export default typescript.config(
  // Ignore patterns
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/.vercel/**',
      '**/.vitepress/**',
      '**/*.test.ts',
    ],
  },

  // Base configs
  js.configs.recommended,
  ...typescript.configs.recommended,
  ...vue.configs['flat/recommended'],

  // TypeScript and Vue files
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        parser: typescript.parser,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        // Vue compiler macros
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
        // Vue reactivity
        ref: 'readonly',
        reactive: 'readonly',
        computed: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
        shallowRef: 'readonly',
        toRef: 'readonly',
        toRefs: 'readonly',
        unref: 'readonly',
        nextTick: 'readonly',
        // Vue lifecycle
        onMounted: 'readonly',
        onUnmounted: 'readonly',
        onBeforeMount: 'readonly',
        onBeforeUnmount: 'readonly',
        onUpdated: 'readonly',
        onBeforeUpdate: 'readonly',
        // Nuxt composables
        useRoute: 'readonly',
        useRouter: 'readonly',
        useHead: 'readonly',
        useSeoMeta: 'readonly',
        useAsyncData: 'readonly',
        useLazyAsyncData: 'readonly',
        useFetch: 'readonly',
        useLazyFetch: 'readonly',
        useNuxtApp: 'readonly',
        useRuntimeConfig: 'readonly',
        useState: 'readonly',
        navigateTo: 'readonly',
        definePageMeta: 'readonly',
        defineNuxtConfig: 'readonly',
        $fetch: 'readonly',
        useToast: 'readonly',
        useDayjs: 'readonly',
        // Custom globals
        __IS_PROD__: 'readonly',
        __API_URL__: 'readonly',
        __VERSION__: 'readonly',
        __POST_ID_PREFIX__: 'readonly',
        __AI_ADMIN_ENDPOINT__: 'readonly',
        __AC_VERSION__: 'readonly',
        __REPO_URL__: 'readonly',
        __AUTH0_DOMAIN__: 'readonly',
        __AUTH0_CLIENT_ID__: 'readonly',
        AwesomeComment: 'readonly',
      },
    },
    rules: {
      'quotes': ['error', 'single'],
      'object-curly-spacing': ['error', 'always'],
      'computed-property-spacing': ['error', 'always'],
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },

  // JavaScript files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },

  // Layout Vue files
  {
    files: ['**/layouts/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
);
