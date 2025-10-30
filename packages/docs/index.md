---
layout: home

hero:
  name: "Awesome Comment"
  text: "AI-Powered Comment System"
  tagline: Break language barriers and boost engagement with AI-powered translation, intelligent replies, and seamless Google One Tap authentication.
  image:
    src: /logo-large.svg
    alt: Awesome Comment
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/awesome-comment/awesome-comment

features:
  - icon: 🤖
    title: AI-Powered Communication
    details: Auto-translate comments from any language and generate intelligent replies instantly with OpenAI GPT or Google Gemini.
  
  - icon: 👆
    title: Google One Tap Login
    details: Zero-friction authentication experience. Users sign in seamlessly without leaving your page - no password required.
  
  - icon: 🌍
    title: Multi-Language Support
    details: Break down language barriers. Comments are automatically translated to your preferred language for better global engagement.
  
  - icon: 📊
    title: Powerful Admin Panel
    details: Manage comments with AI assistance. Batch operations, smart filtering, and real-time analytics at your fingertips.
  
  - icon: 🚀
    title: Cloud Native
    details: Built for modern infrastructure. Deploy on Cloudflare Pages, Vercel, or self-host with TiDB and Upstash Redis.
  
  - icon: 🔒
    title: Privacy First
    details: Free and open source. Self-host to maintain complete control over your data, or use our managed SaaS service.
---

## Quick Example

Add Awesome Comment to your website in just a few lines:

```html
<!-- 1. Add the script -->
<script src="https://unpkg.com/@roudanio/awesome-comment@latest/dist/awesome-comment.umd.js"></script>

<!-- 2. Add a container -->
<div id="comment"></div>

<!-- 3. Initialize -->
<script>
  AwesomeComment.init('#comment', {
    postId: 'your-post-id',
    apiUrl: 'https://your-api-url.com',
    domain: 'your-auth0-domain.auth0.com',
    clientId: 'your-auth0-client-id'
  });
</script>
```

## Why Awesome Comment?

::: tip Real Results
Users love AI-assisted communication. Experience significantly higher engagement rates and more meaningful conversations with your community.
:::

- **Proven Engagement**: AI translation and smart replies increase user participation
- **Simple Integration**: Add to any website with minimal code
- **Modern Stack**: TypeScript, Vue 3, Nuxt 4, and Cloudflare Workers
- **Active Development**: Regular updates with new features and improvements

## Ready to Get Started?

<div class="vp-doc">
  <div class="custom-block tip">
    <p class="custom-block-title">Choose Your Path</p>
    <ul>
      <li><strong>Quick Start</strong>: Get up and running in 5 minutes → <a href="/guide/getting-started">Getting Started</a></li>
      <li><strong>Full Setup</strong>: Complete frontend and backend configuration → <a href="/setup/frontend">Setup Guide</a></li>
      <li><strong>Self-Host</strong>: Deploy your own instance → <a href="/setup/self-hosting">Self-Hosting</a></li>
    </ul>
  </div>
</div>
