# Authentication Setup

Awesome Comment supports two authentication methods:
1. **Auth0** - Traditional OAuth provider
2. **Google One Tap** (Awesome Auth) - Seamless Google authentication

## Auth0 Setup (Traditional)

### 1. Create Auth0 Account

1. Go to [Auth0](https://auth0.com/) and sign up
2. Create a new tenant
3. Create a new application (Single Page Application)

### 2. Configure Application

In your Auth0 application settings:

**Allowed Callback URLs:**
```
https://your-domain.com/callback,
http://localhost:3000/callback
```

**Allowed Logout URLs:**
```
https://your-domain.com,
http://localhost:3000
```

**Allowed Web Origins:**
```
https://your-domain.com,
http://localhost:3000
```

**Allowed Origins (CORS):**
```
https://your-domain.com,
http://localhost:3000
```

### 3. Get Credentials

From your application settings, copy:
- Domain (e.g., `your-domain.auth0.com`)
- Client ID
- Client Secret

### 4. Configure Environment Variables

Add to your `.env`:

```bash
# Frontend (.env or config)
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id

# Backend (packages/admin/.env)
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

### 5. Frontend Integration

```html
<script src="https://unpkg.com/@roudanio/awesome-comment@latest/dist/awesome-comment.umd.js"></script>

<div id="comment"></div>

<script>
  AwesomeComment.init('#comment', {
    postId: 'your-post-id',
    apiUrl: 'https://your-api.com',
    domain: 'your-domain.auth0.com',    // Auth0 domain
    clientId: 'your-auth0-client-id'    // Auth0 client ID
  });
</script>
```

## Google One Tap (Awesome Auth)

Google One Tap provides a seamless, one-click authentication experience.

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Identity Services API**

### 2. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Configure:

**Authorized JavaScript origins:**
```
https://your-domain.com
http://localhost:3000
```

**Authorized redirect URIs:**
```
https://your-domain.com/auth/callback
http://localhost:3000/auth/callback
```

5. Copy your **Client ID**

### 3. Install Awesome Auth

```bash
npm install @roudanio/awesome-auth
# or
pnpm add @roudanio/awesome-auth
```

### 4. Backend Setup

Add to `packages/admin/.env`:

```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 5. Frontend Integration

```javascript
import { getInstance } from '@roudanio/awesome-auth'

// Initialize Awesome Auth
const auth = getInstance({
  googleId: 'your-google-client-id.apps.googleusercontent.com',
  root: 'https://your-backend-api.com'
})

// Initialize Awesome Comment with Awesome Auth
AwesomeComment.init('#comment', {
  postId: 'your-post-id',
  apiUrl: 'https://your-backend-api.com',
  awesomeAuth: auth  // Pass auth instance instead of domain/clientId
})
```

### 6. Test Google One Tap

When users visit your site:
1. Google One Tap prompt appears automatically
2. User clicks "Continue as [Name]"
3. User is authenticated instantly
4. No redirect, no password, no friction

## Comparison: Auth0 vs Google One Tap

| Feature | Auth0 | Google One Tap |
|---------|-------|----------------|
| **Setup Complexity** | Moderate | Easy |
| **User Experience** | Redirects | Seamless |
| **Social Logins** | Multiple | Google only |
| **Customization** | High | Limited |
| **Mobile Support** | Excellent | Good |
| **Cost** | Free tier available | Free |
| **Best For** | Multi-provider auth | Google-focused users |

## User Roles and Permissions

### Default Roles

- **User** - Can comment, like, reply
- **Admin** - Full access to admin panel
- **Moderator** - Can approve/delete comments

### Setting Up Admin Users

#### Method 1: Database

```sql
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'admin@example.com';
```

#### Method 2: Environment Variable

Add to `.env`:

```bash
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

Backend will automatically grant admin rights to these emails.

### Custom Permissions

Implement in backend API:

```typescript
// Example: Check if user is admin
export function isAdmin(user: User): boolean {
  return user.is_admin === true
}

// Example: Check if user can moderate
export function canModerate(user: User): boolean {
  return user.is_admin || user.is_moderator
}
```

## Security Best Practices

### 1. Secure Tokens

```typescript
// Backend: Verify JWT tokens
import { verify } from 'jsonwebtoken'

export function verifyToken(token: string) {
  try {
    return verify(token, process.env.JWT_SECRET)
  } catch {
    throw new Error('Invalid token')
  }
}
```

### 2. Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// Example using Upstash Redis
const rateLimit = {
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
}
```

### 3. CSRF Protection

Enable CSRF tokens for state-changing operations:

```typescript
// Generate CSRF token
const csrfToken = generateToken()

// Validate on server
if (request.csrfToken !== session.csrfToken) {
  throw new Error('Invalid CSRF token')
}
```

### 4. Content Security Policy

Add CSP headers:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'Content-Security-Policy': `
            default-src 'self';
            script-src 'self' https://accounts.google.com;
            connect-src 'self' https://your-api.com;
          `.replace(/\s+/g, ' ').trim()
        }
      }
    }
  }
})
```

## Session Management

### Session Configuration

```bash
# .env
SESSION_SECRET=your-random-secret-key
SESSION_MAX_AGE=86400000  # 24 hours in milliseconds
```

### Session Storage

Sessions are stored in:
- **Development**: Memory
- **Production**: Redis (Upstash)

### Session Expiration

```typescript
// Automatic session refresh
if (session.expiresAt < Date.now()) {
  await refreshSession(session)
}
```

## Multi-tenant Support

For SaaS deployments serving multiple sites:

### 1. Tenant Identification

```typescript
// Identify tenant by domain
const tenant = await getTenantByDomain(request.headers.host)

// Or by API key
const tenant = await getTenantByApiKey(request.headers['x-api-key'])
```

### 2. Isolated Data

```sql
-- Add tenant_id to tables
ALTER TABLE comments ADD COLUMN tenant_id VARCHAR(36);
CREATE INDEX idx_tenant_id ON comments(tenant_id);

-- Query with tenant isolation
SELECT * FROM comments 
WHERE tenant_id = ? 
  AND post_id = ?;
```

### 3. Tenant Configuration

```typescript
interface TenantConfig {
  id: string
  domain: string
  auth0Domain?: string
  auth0ClientId?: string
  googleClientId?: string
  features: {
    aiEnabled: boolean
    translationEnabled: boolean
    moderationEnabled: boolean
  }
}
```

## Troubleshooting

### Auth0 Issues

**"Invalid callback URL"**
- Verify callback URL is added to Auth0 settings
- Check for trailing slashes
- Ensure protocol matches (http vs https)

**"Invalid token"**
- Check token expiration
- Verify Auth0 domain and client ID
- Ensure time sync on server

### Google One Tap Issues

**One Tap not appearing**
- Verify Google Client ID is correct
- Check if user is already signed in
- Ensure domain is authorized in Google Cloud Console
- Try in incognito mode

**"Unauthorized origin"**
- Add your domain to authorized JavaScript origins
- Check for typos in domain name
- Wait a few minutes for changes to propagate

### Common Errors

**401 Unauthorized**
- Token expired or invalid
- User not authenticated
- Check Authorization header

**403 Forbidden**
- User lacks required permissions
- Check user role and permissions

**429 Too Many Requests**
- Rate limit exceeded
- Implement exponential backoff
- Check rate limit settings

## Testing Authentication

### Manual Testing

```bash
# Get access token (Auth0)
curl -X POST https://your-domain.auth0.com/oauth/token \
  -H 'Content-Type: application/json' \
  -d '{
    "grant_type": "client_credentials",
    "client_id": "your-client-id",
    "client_secret": "your-client-secret",
    "audience": "https://your-api.com"
  }'

# Test authenticated endpoint
curl https://your-api.com/api/admin/comments \
  -H 'Authorization: Bearer your-access-token'
```

### Automated Testing

```typescript
// Example test
describe('Authentication', () => {
  it('should authenticate user', async () => {
    const token = await getTestToken()
    const response = await fetch('/api/admin/comments', {
      headers: { Authorization: `Bearer ${token}` }
    })
    expect(response.status).toBe(200)
  })
})
```

## Next Steps

- [Environment Variables](/setup/environment) - Complete configuration reference
- [Self-Hosting](/setup/self-hosting) - Deploy to production
- [API Reference](/api/rest) - Explore available endpoints

## Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [Google Identity Documentation](https://developers.google.com/identity)
- [Awesome Auth GitHub](https://github.com/awesome-comment/awesome-auth)
