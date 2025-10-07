Awesome Comment
=====

A modern, feature-rich comment system built with Vue3 and Nuxt3, designed for static sites and modern web applications.

## Features

### Core Features
- **Multiple Authentication Methods**: Supports Auth0 and Awesome Auth (Google Identity)
- **Comment Management**: Full CRUD operations with nested replies
- **Real-time Updates**: Refresh and live comment updates
- **Like System**: Users can like comments
- **Auto-approval**: Configurable auto-approval for trusted users
- **Spam Detection**: Advanced spam filtering and detection
- **Markdown Support**: Rich text formatting with markdown

### Admin Features
- **AI-Powered Responses**: Generate responses using AI (OpenAI GPT, Gemini)
- **AI Shortcuts**: Quick AI-generated replies with custom templates
- **Emoji Shortcuts**: Quick emoji reactions (❤️, 👍, 😂)
- **Batch Operations**: Approve, delete, or manage multiple comments at once
- **Translation Support**: Auto-translate comments to different languages
- **Context Menu**: Right-click operations for quick actions
- **Filter Options**: Filter by status, language, post ID, user
- **Daily Statistics**: Track comments by language, user, and time

### Developer Features
- **Cloudflare Support**: Built-in Cloudflare caching and Pages deployment
- **TiDB Cloud Integration**: Scalable database backend with TiDB
- **Upstash Redis**: Fast caching layer
- **API First**: RESTful API with comprehensive endpoints
- **ESLint v9**: Modern flat config for code quality
- **TypeScript**: Full type safety with shared core types

## Usage

### Basic Setup

1. Add script to your page
    ```html
   <script async src="https://unpkg.com/@meathill/awesome-comment@latest/dist/awesome-comment.js"></script>
    ``` 
2. Attach awesome comment to your page
    ```javascript
    AwesomeComment.init(
      dom, // container element, or DOM selector
      {
        postId, // unique identifier for the page
        apiUrl, // base URL for the API
        domain, // auth0 domain (optional if using awesomeAuth)
        clientId, // auth0 client id (optional if using awesomeAuth)
        awesomeAuth, // awesome auth instance (optional)
        locale, // language code, defaults to navigator.language
      }
    );
    ```

### With Awesome Auth

```javascript
import { getInstance } from '@roudanio/awesome-auth';

const auth = getInstance({
  googleId: 'YOUR-GOOGLE-CLIENT-ID',
  root: 'https://your-backend-api.com',
});

AwesomeComment.init(dom, {
  postId: 'your-post-id',
  apiUrl: 'https://your-api.com',
  awesomeAuth: auth,
});
```

### Preloading

For better performance, you can preload comments:

```javascript
await AwesomeComment.preload({
  postId: 'your-post-id',
  apiUrl: 'https://your-api.com',
  domain: 'your-auth0-domain',
  clientId: 'your-auth0-client-id',
});

// Later initialize when needed
AwesomeComment.init(dom, { /* options */ });
```

## Structure

- **packages/awesome-comment**
    - Vue3 SPA
    - Main comment widget to be embedded in pages
    - Built with Vite, supports preloading
    - Includes markdown rendering and i18n support
    
- **packages/admin**
    - Nuxt3 admin panel
    - AI-powered comment management
    - Statistics and analytics dashboard
    - Deployed on Cloudflare Pages/Vercel
    
- **packages/core**
    - Pure TypeScript shared library
    - Type definitions and interfaces
    - Common utilities and functions
    - i18n translations
    
- **packages/auth**
    - Awesome Auth integration
    - Google Identity SSO
    - User data storage/retrieval
    - Works standalone or with Awesome Comment
    
- **packages/auth-admin**
    - Backend API for Awesome Auth
    - Serverless/Worker-based authentication
    - JWT token validation
    
- **packages/cronjob**
    - Automated tasks (translation, statistics)
    - Cloudflare Workers-based
    - Scheduled jobs for maintenance

## Recent Improvements

### October 2024
- Added after_id parameter for efficient comment filtering
- Enhanced emoji-only detection in translation system
- Upgraded to ESLint v9 with flat config
- Fixed Nuxt configuration issues

### September 2024
- Support for batch operations (approve, delete multiple comments)
- Added 3rd party AI chat API integration
- Context menu for quick actions
- Auto-submit feature with AI prompts

### August 2024
- Admin display name and avatar customization
- AI shortcut templates
- Gemini 2.0 as default AI model

### July 2024
- Emoji shortcuts for quick reactions
- AI-powered response generation
- Cloudflare caching support

### June 2024
- Daily statistics by user and language
- User agent tracking in admin panel
- Command modifier support for behaviors

### May 2024
- Permanent caching system with Upstash Redis
- Prompt template helper
- Admin reply management

### April 2024
- Reply-to-reply functionality
- Comment count API
- Highlight target comments

### March 2024
- Layout adjustments and responsive design improvements

### February 2024
- Infrastructure moved to Upstash Redis
- IP source provider integration
- Pagination improvements

### October 2023
- Google Identity support with Awesome Auth
- Comment liking system
- User data storage/retrieval

Author
--------

* [Meathill](https://blog.meathill.com)


LICENSE
--------

[MIT](https://opensource.org/license/mit/)
