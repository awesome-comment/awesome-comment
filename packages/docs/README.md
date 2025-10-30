# Awesome Comment Documentation

Official documentation site for Awesome Comment - AI-powered comment system.

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Project Structure

```
packages/docs/
├── .vitepress/
│   └── config.ts          # VitePress configuration
├── guide/                 # User guides
├── setup/                 # Setup instructions
│   ├── frontend.md       # Frontend integration
│   ├── backend.md        # Backend setup
│   ├── database.md       # Database configuration
│   └── authentication.md # Auth setup
├── api/                   # API reference
├── public/                # Static assets
└── index.md              # Homepage
```

## Writing Documentation

### Creating a New Page

1. Create a markdown file in the appropriate directory
2. Add frontmatter if needed:

```md
---
title: Page Title
description: Page description
---

# Page Content
```

3. Add the page to sidebar in `.vitepress/config.ts`

### Markdown Features

VitePress supports:
- **Code blocks** with syntax highlighting
- **Custom containers** (tip, warning, danger, details)
- **Vue components** in markdown
- **Tables**, **emojis**, and more

Example:

```md
::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a dangerous warning
:::
```

## Deployment

### Cloudflare Pages

1. Connect your GitHub repository
2. Build command: `pnpm run build`
3. Output directory: `.vitepress/dist`
4. Set custom domain: `docs.awesomecomment.com`

### Vercel

1. Import GitHub repository
2. Framework preset: VitePress
3. Build command: `pnpm run build`
4. Output directory: `.vitepress/dist`

### Netlify

Create `netlify.toml`:

```toml
[build]
  command = "pnpm run build"
  publish = ".vitepress/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT
