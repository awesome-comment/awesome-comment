import postcss from './postcss.config';
import pkg from './package.json' assert { type: 'json' };

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Awesome comment',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css',
        },
      ],
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0, user-scalable=no',
        },
      ],
      script: [
        {
          src: 'https://unpkg.com/@roudanio/awesome-comment@latest/dist/awesome-comment.umd.js',
          crossorigin: 'anonymous',
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
  runtimeConfig: {
    public: {
      version: pkg.version,
      auth0Domain: process.env.AUTH0_DOMAIN,
      auth0ClientId: process.env.AUTH0_CLIENT_ID,
    },
  },
  postcss,
  routeRules: {
    // pre-rendered at build time
    '/': { prerender: true },
    '/about': { prerender: true },
    '/contact': { prerender: true },
    // pages generated on-demand, revalidates in background
    // Admin dashboard renders only on client-side
    '/**': { ssr: false },
    // Add cors headers on API routes
    '/api/**': { cors: true },
  },
})
