import pkg from './package.json' with { type: 'json' };
import acPkg from '../awesome-comment/package.json' with { type: 'json' };

const repoUrl = `https://unpkg.com/@roudanio/awesome-comment@${acPkg.version}/dist`; // 固定版本，降低供应链风险
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://awesome-comment.org';
const enableSpider = process.env.AC_SPIDER === '1';

const modules = [
  '@nuxt/content',
  '@nuxt/image',
  [
    '@pinia/nuxt',
    {
      autoImports: ['defineStore'],
    },
  ],
  '@nuxt/ui',
  'dayjs-nuxt',
  '@nuxtjs/seo',
];
if (process.env.CLOUDFLARE) {
  modules.push('nitro-cloudflare-dev');
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
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
  compatibilityDate: '2025-10-01',
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  modules,
  ...(process.env.CLOUDFLARE
    ? {
        nitro: {
          preset: 'cloudflare-pages',
        },
      }
    : {}),
  routeRules: {
    // pre-rendered at build time
    '/': { prerender: true },
    // Admin dashboard renders only on client-side
    '/admin/**': { ssr: false, index: false, robots: false },
    '/admin': { redirect: '/admin/login' },
    // Add cors headers on API routes
    '/api/**': { cors: true, index: false, robots: false },
    // If spider not enabled, block all routes from indexing
    ...(enableSpider ? {} : { '/**': { robots: false } }),
  },

  // SEO Configuration
  site: {
    url: siteUrl,
    name: 'Awesome Comment',
    description:
      'AI-powered comment system that breaks language barriers and provides seamless authentication. Free, open source, self-host or use our SaaS.',
    defaultLocale: 'en',
  },

  // Sitemap Configuration
  sitemap: {
    enabled: enableSpider,
    excludeAppSources: true,
    exclude: ['/admin/**', '/api/**'],
    sources: ['/api/__sitemap__/urls'],
  },

  // Robots Configuration
  robots: {
    enabled: true,
    // If AC_SPIDER is not set, disallow all crawlers
    disallow: enableSpider ? ['/admin', '/admin/*', '/api', '/api/*'] : ['/'],
  },

  // SEO Metadata
  ogImage: {
    enabled: false, // Can enable later with custom images
  },

  // Schema.org structured data
  schemaOrg: {
    enabled: true,
    identity: {
      type: 'Organization',
      name: 'Awesome Comment',
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
    },
  },
  runtimeConfig: {
    public: {
      VERSION: pkg.version,
    },
  },
  dayjs: {
    plugins: ['utc', 'timezone'],
  },
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
    },
  },
  ui: {
    fonts: false,
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
});
