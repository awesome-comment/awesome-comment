# SEO Configuration Documentation

## Overview

This document describes the SEO configuration for Awesome Comment website using `@nuxtjs/seo` module.

## Installed Modules

```bash
pnpm add -D @nuxtjs/seo
```

This meta-package includes:
- `@nuxtjs/sitemap` - Automatic sitemap generation
- `@nuxt/robots` - robots.txt generation and management
- `nuxt-schema-org` - Schema.org structured data
- `nuxt-seo-utils` - SEO utilities and helpers
- `nuxt-link-checker` - Link validation (optional)

## Configuration

### Environment Variables

Add to `.env`:
```bash
NUXT_PUBLIC_SITE_URL=https://awesome-comment.pages.dev
```

### Nuxt Config (`nuxt.config.ts`)

#### 1. Site Configuration
```typescript
site: {
  url: siteUrl,
  name: 'Awesome Comment',
  description: 'AI-powered comment system...',
  defaultLocale: 'en',
}
```

#### 2. Sitemap Configuration
```typescript
sitemap: {
  enabled: true,
  excludeAppSources: true,
  exclude: [
    '/admin/**',
    '/api/**',
  ],
  sources: [
    '/api/__sitemap__/urls',
  ],
}
```

**Access sitemap at**: `/sitemap.xml`

#### 3. Robots Configuration
```typescript
robots: {
  enabled: true,
  disallow: [
    '/admin',
    '/admin/*',
    '/api',
    '/api/*',
  ],
}
```

**Access robots.txt at**: `/robots.txt`

#### 4. Route Rules
```typescript
routeRules: {
  '/': { prerender: true },
  '/admin/**': { ssr: false, index: false, robots: false },
  '/api/**': { cors: true, index: false, robots: false },
}
```

#### 5. Schema.org Structured Data
```typescript
schemaOrg: {
  enabled: true,
  identity: {
    type: 'Organization',
    name: 'Awesome Comment',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
  },
}
```

## Page-Level SEO

### Homepage (`pages/index.vue`)

```typescript
useSeoMeta({
  title: 'Awesome Comment - AI-Powered Comment System...',
  description: 'Engage with your global audience...',
  ogTitle: 'Awesome Comment - AI-Powered Comment System',
  ogDescription: 'Break language barriers...',
  ogImage: `${siteUrl}/og-image.png`,
  ogUrl: siteUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: '...',
  twitterDescription: '...',
  twitterImage: '...',
});

useHead({
  title: 'Home',
  titleTemplate: '%s - Awesome Comment',
  htmlAttrs: { lang: 'en' },
  link: [
    { rel: 'canonical', href: siteUrl }
  ],
});
```

### Examples Page (`pages/examples/index.vue`)

```typescript
useSeoMeta({
  title: 'Examples - Awesome Comment',
  description: 'Explore examples and integration guides...',
  ogTitle: 'Examples - Awesome Comment',
  ogDescription: '...',
});
```

### Example Detail Pages

```typescript
useSeoMeta({
  title: 'Preload Example - Awesome Comment',
  description: 'Learn how to preload...',
  robots: 'noindex, follow', // Don't index example pages
});
```

## Sitemap API

### Custom URL Source (`server/api/__sitemap__/urls.ts`)

```typescript
export default defineSitemapEventHandler(() => {
  return [
    {
      loc: '/',
      lastmod: new Date(),
      changefreq: 'weekly',
      priority: 1.0,
    },
    {
      loc: '/examples',
      lastmod: new Date(),
      changefreq: 'monthly',
      priority: 0.8,
    },
    // ... more URLs
  ];
});
```

## Structured Data (JSON-LD)

Added to homepage for better search engine understanding:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Awesome Comment",
  "applicationCategory": "WebApplication",
  "operatingSystem": "Web",
  "description": "...",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "AI-powered auto-translation",
    "Intelligent reply generation",
    "Google One Tap authentication",
    ...
  ]
}
```

## Blocked Paths

The following paths are blocked from indexing:

- `/admin` - Admin dashboard
- `/admin/*` - All admin routes
- `/api` - API endpoints
- `/api/*` - All API routes

## Testing SEO

### Development Environment

In development mode, robots.txt will block all indexing. To test production behavior:

```bash
# Add ?mockProductionEnv query parameter
http://localhost:3001/?mockProductionEnv
```

### Check Generated Files

- **Sitemap**: http://localhost:3001/sitemap.xml
- **Robots**: http://localhost:3001/robots.txt

### Validation Tools

1. **Google Search Console**: Submit sitemap
2. **Lighthouse**: Test SEO score
3. **Meta Tags Validator**: Check Open Graph tags
4. **Structured Data Testing Tool**: Validate JSON-LD

## Production Checklist

- [ ] Set `NUXT_PUBLIC_SITE_URL` environment variable
- [ ] Generate and add `og-image.png` (1200x630px)
- [ ] Add `logo.png` for schema.org
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Verify robots.txt is accessible
- [ ] Test meta tags with social media debuggers
- [ ] Check structured data with Google Rich Results Test
- [ ] Verify canonical URLs are correct
- [ ] Test page load speed and Core Web Vitals

## SEO Best Practices Implemented

✅ **Technical SEO**
- Semantic HTML structure
- Mobile-responsive design
- Fast page load times (Nuxt 4 + SSR)
- Clean URL structure
- Canonical URLs
- Proper meta descriptions

✅ **Content SEO**
- Keyword-rich titles and descriptions
- H1-H6 heading hierarchy
- Alt text for images (when added)
- Internal linking structure

✅ **Social SEO**
- Open Graph tags for Facebook/LinkedIn
- Twitter Card tags
- Social media preview images

✅ **Schema.org Structured Data**
- Organization identity
- SoftwareApplication schema
- Breadcrumbs (can be added)

## Future Enhancements

1. **Multi-language Support**
   - Add hreflang tags
   - Language-specific sitemaps

2. **Rich Snippets**
   - FAQ schema for common questions
   - HowTo schema for tutorials
   - Article schema for blog posts

3. **Performance**
   - Add preconnect hints
   - Optimize images with @nuxt/image
   - Implement lazy loading

4. **Analytics**
   - Add Google Analytics / Plausible
   - Track conversion events
   - Monitor search rankings

## Troubleshooting

### Sitemap not generating

Check:
1. `excludeAppSources: true` in sitemap config
2. API endpoint returns valid array
3. No TypeScript errors in `/server/api/__sitemap__/urls.ts`

### Robots.txt blocking everything

In development, this is expected. Test with `?mockProductionEnv` or deploy to staging.

### Meta tags not showing

1. Check browser's "View Source"
2. Use Meta Tags Validator tool
3. Verify `useSeoMeta()` is called in `<script setup>`

### Structured data errors

Use Google's Rich Results Test to validate JSON-LD syntax.

## Resources

- [@nuxtjs/seo Documentation](https://nuxtseo.com/)
- [Nuxt SEO Best Practices](https://nuxt.com/docs/getting-started/seo-meta)
- [Schema.org Vocabulary](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
