import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Awesome Comment",
  description: "AI-powered comment system with auto-translation and seamless authentication",
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c8772' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/what-is-awesome-comment' },
      { text: 'Setup', link: '/setup/frontend' },
      { text: 'API', link: '/api/rest' },
      { 
        text: 'v1.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Contributing', link: '/contributing' },
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Awesome Comment?', link: '/guide/what-is-awesome-comment' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Features', link: '/guide/features' },
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'AI Features', link: '/guide/ai-features' },
            { text: 'Authentication', link: '/guide/authentication' },
          ]
        }
      ],
      '/setup/': [
        {
          text: 'Installation',
          items: [
            { text: 'Frontend Setup', link: '/setup/frontend' },
            { text: 'Backend Setup', link: '/setup/backend' },
            { text: 'Database Configuration', link: '/setup/database' },
            { text: 'Authentication Setup', link: '/setup/authentication' },
          ]
        },
        {
          text: 'Deployment',
          items: [
            { text: 'Self-Hosting', link: '/setup/self-hosting' },
            { text: 'Cloudflare Pages', link: '/setup/cloudflare' },
            { text: 'Vercel', link: '/setup/vercel' },
          ]
        },
        {
          text: 'Configuration',
          items: [
            { text: 'Environment Variables', link: '/setup/environment' },
            { text: 'AI Services', link: '/setup/ai-services' },
            { text: 'Translation', link: '/setup/translation' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'REST API', link: '/api/rest' },
            { text: 'JavaScript SDK', link: '/api/javascript-sdk' },
            { text: 'Events', link: '/api/events' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/awesome-comment/awesome-comment' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Awesome Comment Team'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/awesome-comment/awesome-comment/edit/main/packages/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
