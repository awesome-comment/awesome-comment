# Awesome Comment Admin

Official website and admin panel for Awesome Comment - an AI-powered comment system.

## Features

- 🎨 Modern UI with Nuxt UI components
- 🤖 AI-powered comment management
- 🌍 Multi-language support with auto-translation
- 🔐 Google One Tap seamless authentication
- 📊 Analytics and statistics dashboard
- 🔍 SEO optimized with automatic sitemap generation

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

### Environment Variables

Copy `.env.sample` to `.env` and configure:

```bash
# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Database
TIDB_PUBLIC_KEY=your-tidb-public-key
TIDB_PRIVATE_KEY=your-tidb-private-key

# SEO Configuration
NUXT_PUBLIC_SITE_URL=https://awesome-comment.pages.dev

# Spider Control (ONLY for official site)
# Set to "1" to allow search engine indexing
# Default: disabled (recommended for self-hosted instances)
# AC_SPIDER=1
```

**Important**: By default, all search engine crawlers are blocked. Only set `AC_SPIDER=1` for the official Awesome Comment website. Self-hosted instances should keep this disabled to protect privacy and avoid SEO issues.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm run dev
```

## Production

Build the application for production:

```bash
pnpm run build
```

Locally preview production build:

```bash
pnpm run preview
```

## SEO Configuration

This project uses `@nuxtjs/seo` for comprehensive SEO optimization:

- ✅ Automatic sitemap generation at `/sitemap.xml`
- ✅ Dynamic robots.txt at `/robots.txt`
- ✅ Open Graph and Twitter Cards
- ✅ Schema.org structured data
- ✅ Blocked paths: `/admin/**`, `/api/**`

See [SEO-CONFIG.md](./SEO-CONFIG.md) for detailed documentation.

### SEO URLs

- **Sitemap**: https://awesome-comment.pages.dev/sitemap.xml
- **Robots**: https://awesome-comment.pages.dev/robots.txt

## Project Structure

```
packages/admin/
├── pages/                 # Application pages
│   ├── index.vue         # Homepage with live demo
│   ├── examples/         # Integration examples
│   └── admin/           # Admin dashboard
├── components/           # Vue components
│   ├── layouts/         # Layout components
│   └── ui/             # UI components
├── server/              # Server-side code
│   └── api/            # API endpoints
│       └── __sitemap__/ # Sitemap generation
├── public/              # Static assets
├── assets/              # Compiled assets
├── nuxt.config.ts       # Nuxt configuration
└── SEO-CONFIG.md       # SEO documentation
```

## Documentation

- [SEO Configuration](./SEO-CONFIG.md) - Complete SEO setup guide
- [Nuxt Documentation](https://nuxt.com/docs) - Nuxt framework docs
- [Nuxt UI Documentation](https://ui.nuxt.com/) - Component library

## Deployment

### Cloudflare Pages

1. Set `CLOUDFLARE=1` environment variable
2. Build command: `pnpm run build`
3. Output directory: `.output/public`

### Vercel

1. Import repository
2. Set environment variables
3. Deploy automatically on push

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more platforms.

## License

MIT
