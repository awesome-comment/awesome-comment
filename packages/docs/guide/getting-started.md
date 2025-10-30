# Getting Started

This guide will help you integrate Awesome Comment into your website in under 5 minutes.

## What You'll Need

- A website or blog (static or dynamic)
- Basic knowledge of HTML and JavaScript
- (Optional) A backend API or use our hosted service

## Quick Start

### 1. Add the Script

Add this script tag to your HTML, preferably before the closing `</body>` tag:

```html
<script src="https://unpkg.com/@roudanio/awesome-comment@latest/dist/awesome-comment.umd.js"></script>
```

### 2. Add a Container

Add a container element where you want the comments to appear:

```html
<div id="comment"></div>
```

### 3. Initialize

Add the initialization script:

```html
<script>
  AwesomeComment.init('#comment', {
    postId: 'my-first-post',
    apiUrl: 'https://api.awesomecomment.com',
    domain: 'awesomecomment.auth0.com',
    clientId: 'your-client-id'
  });
</script>
```

### Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Blog Post</title>
</head>
<body>
  <article>
    <h1>My First Blog Post</h1>
    <p>This is my amazing blog post content...</p>
  </article>

  <!-- Comment Section -->
  <section id="comments">
    <h2>Comments</h2>
    <div id="comment"></div>
  </section>

  <!-- Awesome Comment -->
  <script src="https://unpkg.com/@roudanio/awesome-comment@latest/dist/awesome-comment.umd.js"></script>
  <script>
    AwesomeComment.init('#comment', {
      postId: 'my-first-post',
      apiUrl: 'https://api.awesomecomment.com',
      domain: 'awesomecomment.auth0.com',
      clientId: 'demo-client-id'
    });
  </script>
</body>
</html>
```

## Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `postId` | string | Yes | Unique identifier for the post/page |
| `apiUrl` | string | Yes | Your backend API URL |
| `domain` | string | Yes* | Auth0 domain |
| `clientId` | string | Yes* | Auth0 client ID |
| `awesomeAuth` | object | Yes* | Awesome Auth instance (alternative to Auth0) |
| `locale` | string | No | Language code (e.g., 'en', 'zh-CN') |

*Either provide `domain` + `clientId` OR `awesomeAuth`

## Using Google One Tap (Recommended)

For a seamless login experience, use Awesome Auth with Google One Tap:

```bash
npm install @roudanio/awesome-auth
```

```javascript
import { getInstance } from '@roudanio/awesome-auth'

const auth = getInstance({
  googleId: 'your-google-client-id.apps.googleusercontent.com',
  root: 'https://your-api.com'
})

AwesomeComment.init('#comment', {
  postId: 'my-first-post',
  apiUrl: 'https://your-api.com',
  awesomeAuth: auth  // Use Google One Tap instead of Auth0
})
```

## Next Steps

Now that you have a basic setup, explore more features:

### For Users
- [Frontend Setup](/setup/frontend) - Advanced integration options
- [Features Guide](/guide/features) - Explore all features
- [API Reference](/api/javascript-sdk) - JavaScript SDK documentation

### For Self-Hosting
- [Backend Setup](/setup/backend) - Set up your own API server
- [Database Configuration](/setup/database) - Configure TiDB or PostgreSQL
- [Authentication Setup](/setup/authentication) - Set up Auth0 or Google One Tap
- [Self-Hosting Guide](/setup/self-hosting) - Complete deployment guide

## Getting Help

- 📖 [Documentation](https://docs.awesomecomment.com)
- 💬 [GitHub Discussions](https://github.com/awesome-comment/awesome-comment/discussions)
- 🐛 [Issue Tracker](https://github.com/awesome-comment/awesome-comment/issues)
- 📧 [Email Support](mailto:support@awesomecomment.com)

## Demo

Try it yourself! See Awesome Comment in action on our [demo page](https://awesomecomment.com/examples).
