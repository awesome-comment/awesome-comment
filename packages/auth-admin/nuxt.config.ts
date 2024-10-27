const modules = [
  '@nuxt/image',
  [
    '@pinia/nuxt',
    {
      autoImports: ['defineStore'],
    },
  ],
  '@nuxt/ui',
  'dayjs-nuxt',
];
if (process.env.CLOUDFLARE) {
  modules.push('nitro-cloudflare-dev');
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Awesome Auth',
      link: [

      ],
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0, user-scalable=no',
        },
      ],
    },
  },
  compatibilityDate: '2024-10-27',
  css: [
    '~/assets/css/main.css',
  ],
  devtools: { enabled: true },
  modules,
  nitro: {
    preset: 'cloudflare-pages',
  },
  routeRules: {
    // Add cors headers on API routes
    '/api/**': { cors: true },
  },
  dayjs: {
    plugins: ['utc', 'timezone'],
  },
  postcss: {
    plugins: {
      'postcss-import': {},
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
      ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
    },
  },
  ui: {
    icons: ['bi'],
  },
});
