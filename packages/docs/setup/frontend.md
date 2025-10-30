# Frontend Setup

This guide will walk you through integrating Awesome Comment into your website's frontend.

## Installation

### CDN (Recommended for Quick Start)

The easiest way to get started is to use the CDN version:

```html
<script src="https://unpkg.com/@roudanio/awesome-comment@latest/dist/awesome-comment.umd.js"></script>
```

### NPM/PNPM

For build tools and bundlers:

```bash
# npm
npm install @roudanio/awesome-comment

# pnpm
pnpm add @roudanio/awesome-comment

# yarn
yarn add @roudanio/awesome-comment
```

## Basic Integration

### 1. Add the Script

Add the Awesome Comment script to your HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <!-- Your content -->
  
  <!-- Add Awesome Comment script -->
  <script src="https://unpkg.com/@roudanio/awesome-comment@latest/dist/awesome-comment.umd.js"></script>
</body>
</html>
```

### 2. Add a Container

Add a container element where the comment widget will be rendered:

```html
<div id="comment"></div>
```

### 3. Initialize

Initialize Awesome Comment with your configuration:

```html
<script>
  AwesomeComment.init('#comment', {
    postId: 'unique-post-identifier',
    apiUrl: 'https://your-backend-api.com',
    domain: 'your-domain.auth0.com',
    clientId: 'your-auth0-client-id',
    locale: 'en' // Optional: 'en', 'zh-CN', etc.
  });
</script>
```

## Configuration Options

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `postId` | `string` | Unique identifier for the page/post. Used to group comments. |
| `apiUrl` | `string` | Your backend API endpoint URL. |
| `domain` | `string` | Auth0 domain for authentication (e.g., `your-domain.auth0.com`). |
| `clientId` | `string` | Auth0 client ID for your application. |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `locale` | `string` | Browser language | UI language code (e.g., `'en'`, `'zh-CN'`, `'ja'`). |
| `theme` | `string` | `'light'` | Theme mode: `'light'` or `'dark'`. |
| `awesomeAuth` | `object` | `null` | Awesome Auth instance for Google One Tap login. |

## Using with Modern Frameworks

### Vue 3 / Nuxt 3

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <div ref="commentContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const commentContainer = ref(null)
const title = 'My Blog Post'

onMounted(() => {
  // Load script dynamically
  const script = document.createElement('script')
  script.src = 'https://unpkg.com/@roudanio/awesome-comment@latest/dist/awesome-comment.umd.js'
  script.onload = () => {
    window.AwesomeComment.init(commentContainer.value, {
      postId: 'blog-post-123',
      apiUrl: 'https://api.example.com',
      domain: 'example.auth0.com',
      clientId: 'your-client-id'
    })
  }
  document.body.appendChild(script)
})
</script>
```

### React

```jsx
import { useEffect, useRef } from 'react'

function CommentSection({ postId }) {
  const commentRef = useRef(null)

  useEffect(() => {
    // Load script
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@roudanio/awesome-comment@latest/dist/awesome-comment.umd.js'
    script.async = true
    
    script.onload = () => {
      if (window.AwesomeComment && commentRef.current) {
        window.AwesomeComment.init(commentRef.current, {
          postId: postId,
          apiUrl: process.env.REACT_APP_API_URL,
          domain: process.env.REACT_APP_AUTH0_DOMAIN,
          clientId: process.env.REACT_APP_AUTH0_CLIENT_ID
        })
      }
    }
    
    document.body.appendChild(script)
    
    return () => {
      document.body.removeChild(script)
    }
  }, [postId])

  return <div ref={commentRef}></div>
}

export default CommentSection
```

### Next.js

```jsx
'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

export default function Comments({ postId }) {
  const commentRef = useRef(null)

  const handleScriptLoad = () => {
    if (window.AwesomeComment && commentRef.current) {
      window.AwesomeComment.init(commentRef.current, {
        postId: postId,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
        clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
      })
    }
  }

  return (
    <>
      <Script
        src="https://unpkg.com/@roudanio/awesome-comment@latest/dist/awesome-comment.umd.js"
        onLoad={handleScriptLoad}
      />
      <div ref={commentRef}></div>
    </>
  )
}
```

## Using Awesome Auth (Google One Tap)

For seamless Google One Tap authentication:

### 1. Install Awesome Auth

```bash
pnpm add @roudanio/awesome-auth
```

### 2. Initialize Awesome Auth

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
  awesomeAuth: auth  // Pass the auth instance
})
```

::: tip
When using Awesome Auth, you don't need to provide `domain` and `clientId` parameters.
:::

## Preloading for Better Performance

To avoid Cumulative Layout Shift (CLS), you can preload the comment data:

```javascript
// Preload comment data
await AwesomeComment.preload({
  postId: 'your-post-id',
  apiUrl: 'https://your-backend-api.com',
  domain: 'your-domain.auth0.com',
  clientId: 'your-client-id'
})

// Later, initialize the UI
AwesomeComment.init('#comment', {
  postId: 'your-post-id',
  // ... same config
})
```

## Styling

Awesome Comment comes with default styles. To customize:

```css
/* Override CSS variables */
:root {
  --ac-primary-color: #3c8772;
  --ac-border-radius: 8px;
  --ac-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Or target specific elements */
.awesome-comment-container {
  max-width: 800px;
  margin: 0 auto;
}
```

## Next Steps

- [Backend Setup](/setup/backend) - Set up your API server
- [Authentication Setup](/setup/authentication) - Configure Auth0 or Google One Tap
- [Database Configuration](/setup/database) - Set up TiDB or PostgreSQL

## Troubleshooting

### Comments not showing

1. Check browser console for errors
2. Verify `apiUrl` is accessible
3. Ensure `postId` is unique and consistent
4. Check CORS settings on your backend

### Authentication issues

1. Verify Auth0 credentials are correct
2. Check Auth0 allowed callback URLs include your domain
3. For Google One Tap, ensure Google Client ID is configured

### Performance issues

1. Use preloading to avoid CLS
2. Consider lazy loading the script
3. Cache API responses on your backend

## Examples

Check out our [examples repository](https://github.com/awesome-comment/awesome-comment/tree/main/examples) for more integration patterns.
