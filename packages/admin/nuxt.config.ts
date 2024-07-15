import pkg from './package.json' assert { type: 'json' };
import acPkg from '../awesome-comment/package.json' assert { type: 'json' };

const repoUrl = 'https://unpkg.com/@roudanio/awesome-comment@latest/dist'; // use online ver for now
const modules = [
  '@nuxt/content',
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
      title: 'Awesome comment',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://unpkg.com/bootstrap-icons@1.11.3/font/bootstrap-icons.css',
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
  compatibilityDate: '2024-07-06',
  css: [
    '~/assets/css/main.css',
  ],
  devtools: { enabled: true },
  modules,
  nitro: {
    preset: 'cloudflare-pages',
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
    '/admin/**': { ssr: false },
    '/admin': { redirect: '/admin/login' },
    // Add cors headers on API routes
    '/api/**': { cors: true },
  },
  vite: {
    define: {
      __VERSION__: JSON.stringify(pkg.version),
      __AC_VERSION__: JSON.stringify(acPkg.version),
      __AUTH0_DOMAIN__: JSON.stringify(process.env.AUTH0_DOMAIN),
      __AUTH0_CLIENT_ID__: JSON.stringify(process.env.AUTH0_CLIENT_ID),
      __REPO_URL__: JSON.stringify(repoUrl),
      __POST_ID_PREFIX__: JSON.stringify(process.env.POST_ID_PREFIX || ''),
    },
  },
  dayjs: {
    plugins: ['utc', 'timezone'],
  },
  ui: {
    icons: ['bi'],
  },
});
