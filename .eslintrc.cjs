module.exports = {
  'env': {
    'browser': true,
    'es2022': true,
    'node': true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  extends: [
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:vue/vue3-recommended'
  ],
  plugins: [
    'vue',
  ],
  globals: {
    withDefaults: true,
    defineProps: true,
    defineEmits: true,
    defineExpose: true,

    __IS_PROD__: true,
    __API_URL__: true,
    __VERSION__: true,
  },
  rules: {
    'quotes': [ 'error', 'single' ],
    'object-curly-spacing': [ 'error', 'always' ],
    'computed-property-spacing': [ 'error', 'always' ],
    '@typescript-eslint/no-unused-vars': 0,
  },
  overrides: [
    {
      files: ['**/layouts/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off',
      },
    },
  ],
}
