# Backend Setup

This guide covers setting up the Awesome Comment backend API server.

## Overview

The Awesome Comment backend is built with:
- **Nuxt 4** - Server framework
- **TiDB Cloud** or **PostgreSQL** - Database
- **Upstash Redis** - Caching layer
- **Cloudflare Workers** (optional) - Edge deployment

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- pnpm package manager
- A database (TiDB Cloud or PostgreSQL)
- Redis instance (Upstash recommended)
- Auth0 account or Google Cloud project

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/awesome-comment/awesome-comment.git
cd awesome-comment
```

### 2. Install Dependencies

```bash
# Install pnpm if you haven't
npm install -g pnpm

# Install dependencies
pnpm install
```

### 3. Navigate to Admin Package

The backend API is part of the admin package:

```bash
cd packages/admin
```

## Configuration

### Environment Variables

Create a `.env` file in `packages/admin`:

```bash
# Copy example file
cp .env.sample .env
```

Edit `.env` with your configuration:

```bash
# Auth0 Configuration (if using Auth0)
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# Database Configuration
# Option 1: TiDB Cloud
TIDB_PUBLIC_KEY=your-tidb-public-key
TIDB_PRIVATE_KEY=your-tidb-private-key

# Option 2: PostgreSQL (see Database Configuration)
# DATABASE_URL=postgresql://user:password@host:5432/database

# Redis Configuration (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# AI Services (Optional but recommended)
OPENAI_API_KEY=sk-your-openai-key
# or
GOOGLE_GEMINI_API_KEY=your-gemini-key

# Admin 端 AI Provider（可选，默认 openai）
ADMIN_AI_PROVIDER=openai
# 可选：强制指定 admin 端模型
ADMIN_AI_MODEL=

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Site Configuration
NUXT_PUBLIC_SITE_URL=https://your-domain.com

# Spider Control (Only for official site)
# AC_SPIDER=1
```

## Database Setup

### Option 1: TiDB Cloud (Recommended)

1. **Create a TiDB Serverless Cluster**
   - Go to [TiDB Cloud](https://tidbcloud.com/)
   - Create a free Serverless cluster
   - Get your connection credentials

2. **Run Migrations**
   ```bash
   pnpm run db:migrate
   ```

3. **Seed Initial Data** (Optional)
   ```bash
   pnpm run db:seed
   ```

### Option 2: PostgreSQL

1. **Create Database**
   ```bash
   createdb awesome_comment
   ```

2. **Configure Connection**
   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/awesome_comment
   ```

3. **Run Migrations**
   ```bash
   pnpm run db:migrate
   ```

See [Database Configuration](/setup/database) for detailed schema and migration guides.

## Redis Setup

### Upstash Redis (Recommended)

1. **Create an Upstash Redis Database**
   - Go to [Upstash Console](https://console.upstash.com/)
   - Create a new Redis database
   - Choose a region close to your users

2. **Get REST API Credentials**
   - Copy the REST URL and Token
   - Add them to your `.env` file

3. **Test Connection**
   ```bash
   pnpm run test:redis
   ```

### Self-Hosted Redis

If you prefer to self-host Redis:

```bash
# Install Redis
brew install redis  # macOS
# or
apt-get install redis-server  # Ubuntu

# Start Redis
redis-server

# Configure in .env
REDIS_URL=redis://localhost:6379
```

## Running the Server

### Development Mode

```bash
pnpm run dev
```

Server will start at `http://localhost:3000`

### Production Mode

```bash
# Build
pnpm run build

# Start
pnpm run start
```

## API Endpoints

Once running, your backend provides these key endpoints:

### Comments API

- `GET /api/comments?postId={postId}` - Get comments for a post
- `POST /api/comments` - Create a new comment
- `PUT /api/comments/:id` - Update a comment
- `DELETE /api/comments/:id` - Delete a comment
- `POST /api/comments/:id/like` - Like a comment

### Admin API

- `GET /api/admin/comments` - Get all comments (requires auth)
- `POST /api/admin/comments/:id/approve` - Approve a comment
- `POST /api/admin/comments/:id/translate` - Translate a comment
- `POST /api/admin/comments/:id/ai-reply` - Generate AI reply

### Authentication API

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

## API Authentication

### For Users (Frontend)

Users authenticate via:
1. Auth0 (traditional)
2. Google One Tap (Awesome Auth)

No additional backend configuration needed.

### For Admin Panel

Admins must authenticate to access protected endpoints:

```javascript
// Example: Make authenticated request
fetch('https://your-api.com/api/admin/comments', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

## AI Integration

### OpenAI Setup

1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to `.env`:
   ```bash
   OPENAI_API_KEY=sk-your-key
   ```

### Google Gemini Setup

1. Get API key from [Google AI Studio](https://makersuite.google.com/)
2. Add to `.env`:
   ```bash
   GOOGLE_GEMINI_API_KEY=your-key
   ```

### Admin 端 AI Provider 切换

默认使用 OpenAI。如需切换为 Google AI Studio：

```bash
ADMIN_AI_PROVIDER=google
```

你也可以通过 `ADMIN_AI_MODEL` 指定 admin 端模型（例如 `gemini-2.5-pro`）。

### Cloudflare AI Gateway（可选）

如果你希望所有 AI provider 请求通过 Cloudflare AI Gateway 代理，请在后端与 Cronjob 环境中增加以下变量：

```bash
# Cloudflare AI Gateway 基础地址（不包含 provider 路径）
AI_GATEWAY_BASE_URL=https://gateway.ai.cloudflare.com/v1/<account_id>/<gateway_name>
# 可选：需要鉴权时设置
AI_GATEWAY_TOKEN=your-cloudflare-token
```

说明：
- OpenAI 会自动走 `${AI_GATEWAY_BASE_URL}/openai`
- Google Gemini 会自动走 `${AI_GATEWAY_BASE_URL}/google-ai-studio`

### Translation Service

Awesome Comment uses AI for translation:
- Automatically detects comment language
- Translates to admin's preferred language
- Supports 100+ languages

## Caching Strategy

Redis is used for:
- Comment caching (reduce database queries)
- Rate limiting
- Session storage
- Translation cache

Default cache TTL: 5 minutes

## Security Considerations

### CORS Configuration

Configure allowed origins in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': 'https://your-site.com'
      }
    }
  }
})
```

### Rate Limiting

Built-in rate limiting protects your API:
- 60 requests per minute per IP (comments)
- 10 requests per minute per IP (admin actions)

### Input Validation

All inputs are validated and sanitized:
- XSS protection
- SQL injection prevention
- Content Security Policy headers

## Monitoring & Logs

### Application Logs

Logs are written to:
- Console (development)
- File system (production)
- Cloud logging service (if configured)

### Performance Monitoring

Recommended tools:
- **Sentry** - Error tracking
- **New Relic** - APM
- **Upstash Console** - Redis metrics

## Deployment

Ready to deploy? Choose your platform:

- [Self-Hosting Guide](/setup/self-hosting)
- [Cloudflare Pages](/setup/cloudflare)
- [Vercel](/setup/vercel)

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
pnpm run db:test

# Check migrations
pnpm run db:status
```

### Redis Connection Issues

```bash
# Test Redis connection
pnpm run test:redis

# Check Redis logs
redis-cli ping
```

### API Not Responding

1. Check if server is running: `curl http://localhost:3000/api/health`
2. Verify environment variables are loaded
3. Check firewall/port settings
4. Review server logs

### CORS Errors

1. Verify `Access-Control-Allow-Origin` is set correctly
2. Check if frontend domain is allowed
3. Ensure credentials are included in requests

## Next Steps

- [Database Configuration](/setup/database) - Detailed schema and indexes
- [Authentication Setup](/setup/authentication) - Configure Auth0 or Google
- [Deployment Guide](/setup/self-hosting) - Deploy to production

## API Documentation

For complete API reference, see [REST API Documentation](/api/rest).
