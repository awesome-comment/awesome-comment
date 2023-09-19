import pkg from './package.json' assert { type: 'json' };
import acPkg from '../awesome-comment/package.json' assert { type: 'json' };

const repoUrl = 'https://unpkg.com/@roudanio/awesome-comment@latest/dist'; // use online ver for now

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Awesome comment',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css',
        },
        {
          rel: 'stylesheet',
          href: repoUrl + '/style.css',
        },
      ],
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0, user-scalable=no',
        },
      ],
    },
  },
  css: [
    '~/assets/css/main.css',
  ],
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    [
      '@pinia/nuxt',
      {
        autoImports: ['defineStore'],
      },
    ],
  ],
  nitro: {
    storage: {
      data: { driver: 'vercelKV' },
    },
  },
  runtimeConfig: {
    public: {
      version: pkg.version,
      acVersion: acPkg.version,
      auth0Domain: process.env.AUTH0_DOMAIN,
      auth0ClientId: process.env.AUTH0_CLIENT_ID,
      repoUrl,
    },
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
  routeRules: {
    // pre-rendered at build time
    '/': { prerender: true },
    // '/about': { prerender: true },
    // '/contact': { prerender: true },
    // pages generated on-demand, revalidates in background
    // Admin dashboard renders only on client-side
    '/admin/': { redirect: '/admin/login' },
    '/admin/**': { ssr: false },
    // Add cors headers on API routes
    '/api/**': { cors: true },
  },
})
