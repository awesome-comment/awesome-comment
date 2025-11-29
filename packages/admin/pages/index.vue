<script setup lang="ts">
const siteUrl = 'https://awesome-comment.org';

// SEO Configuration
useSeoMeta({
  title: 'Awesome Comment - AI-Powered Comment System with Seamless Authentication',
  description: 'Engage with your global audience effortlessly. AI-powered comment system that breaks language barriers with auto-translation, AI replies, and Google One Tap login. Free and open source.',
  ogTitle: 'Awesome Comment - AI-Powered Comment System',
  ogDescription: 'Break language barriers and boost engagement with AI-powered translation, intelligent replies, and seamless Google One Tap authentication.',
  ogImage: `${siteUrl}/og-image.png`,
  ogUrl: siteUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: 'Awesome Comment - AI-Powered Comment System',
  twitterDescription: 'AI-powered comments with auto-translation, intelligent replies, and Google One Tap login. Boost engagement effortlessly.',
  twitterImage: `${siteUrl}/og-image.png`,
});

useHead({
  title: 'Home',
  titleTemplate: '%s - Awesome Comment',
  htmlAttrs: {
    lang: 'en',
  },
  link: [
    {
      rel: 'canonical',
      href: siteUrl,
    },
  ],
  script: [
    {
      src: __REPO_URL__ + '/awesome-comment.umd.js',
      crossorigin: 'anonymous',
      async: true,
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Awesome Comment',
        applicationCategory: 'WebApplication',
        operatingSystem: 'Web',
        description: 'AI-powered comment system that breaks language barriers and provides seamless authentication.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'AI-powered auto-translation',
          'Intelligent reply generation with GPT/Gemini',
          'Google One Tap seamless authentication',
          'Real-time comment management',
          'Spam detection and auto-approval',
          'Markdown support',
        ],
        author: {
          '@type': 'Organization',
          name: 'Awesome Comment',
          url: siteUrl,
        },
      }),
    },
  ],
});

// 核心亮点 - 突出两大优势
const highlights = [
  {
    icon: 'i-heroicons-sparkles',
    title: 'AI-Powered Communication',
    description: 'Better engage with your users through AI assistance',
    features: [
      'Auto-translate comments from any language',
      'Generate intelligent replies instantly',
      'Proven to increase user engagement significantly'
    ]
  },
  {
    icon: 'i-heroicons-finger-print',
    title: 'Seamless Google One Tap Login',
    description: 'Frictionless authentication for better conversion',
    features: [
      'Zero-friction login experience',
      'Users sign in without leaving the page',
      'No password required, just one tap'
    ]
  }
];

const features = [
  {
    icon: 'i-heroicons-language',
    title: 'Auto Translation',
    description: 'Break language barriers - automatically translate comments to your preferred language'
  },
  {
    icon: 'i-heroicons-sparkles',
    title: 'AI Reply Generation',
    description: 'Generate contextual responses with OpenAI GPT or Google Gemini in seconds'
  },
  {
    icon: 'i-heroicons-chat-bubble-left-right',
    title: 'Boost User Engagement',
    description: 'Real-world results show users love to communicate when AI helps bridge the gap'
  },
  {
    icon: 'i-heroicons-finger-print',
    title: 'Google One Tap',
    description: 'Invisible login - users authenticate seamlessly without interruption'
  },
  {
    icon: 'i-heroicons-shield-check',
    title: 'Spam Detection',
    description: 'Advanced filtering with auto-approval for trusted users'
  },
  {
    icon: 'i-heroicons-code-bracket',
    title: 'Markdown Support',
    description: 'Rich text formatting for better content expression'
  }
];

const adminFeatures = [
  {
    icon: 'i-heroicons-sparkles',
    title: 'AI-Powered Replies',
    description: 'Generate contextual responses instantly with GPT or Gemini - respond to users in any language'
  },
  {
    icon: 'i-heroicons-language',
    title: 'One-Click Translation',
    description: 'Translate foreign comments automatically - understand and respond to global users effortlessly'
  },
  {
    icon: 'i-heroicons-bolt',
    title: 'Smart Shortcuts',
    description: 'AI templates and emoji reactions (❤️, 👍, 😂) for lightning-fast responses'
  },
  {
    icon: 'i-heroicons-chart-bar',
    title: 'Engagement Analytics',
    description: 'Track how AI-assisted communication boosts user participation and satisfaction'
  }
];

const techStack = [
  {
    icon: 'i-heroicons-cloud',
    title: 'Cloudflare Support',
    description: 'Built-in caching and Pages deployment for optimal performance'
  },
  {
    icon: 'i-heroicons-circle-stack',
    title: 'TiDB Cloud & Upstash Redis',
    description: 'Scalable database backend with fast caching layer'
  },
  {
    icon: 'i-heroicons-code-bracket-square',
    title: 'Modern Development',
    description: 'TypeScript, ESLint v9, API-first design with full type safety'
  }
];

const contributors = [
  {
    name: 'Meathill Zhai',
    avatar: '/images/meathill.webp',
    github: 'https://github.com/meathill',
    twitter: 'https://twitter.com/meathill1',
    blog: 'https://blog.meathill.com/'
  },
  {
    name: 'Bamboo',
    avatar: 'https://avatars.githubusercontent.com/u/14840170?v=4',
    github: 'https://github.com/bambooom'
  },
  {
    name: 'Mystery Boss',
    avatar: null
  }
];

function initAwesomeComment(): void {
  if (!window.AwesomeComment) {
    setTimeout(initAwesomeComment, 100);
    return;
  }
  AwesomeComment.init(
    '#comment',
    {
      postId: 'awesome-comment-self',
      domain: __AUTH0_DOMAIN__,
      clientId: __AUTH0_CLIENT_ID__,
    },
  );
}

onMounted(initAwesomeComment);
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section with Live Demo -->
    <section class="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div class="container mx-auto px-4 py-12 sm:py-16">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <!-- Left: Hero Content + Features + Quick Start -->
          <div class="space-y-12">
            <!-- Hero Content -->
            <div>
              <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Awesome Comment
              </h1>
              <p class="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-4">
                Engage with your global audience effortlessly
              </p>
              <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
                AI-powered comment system that breaks language barriers and provides seamless authentication.
                Free, open source, self-host or use our SaaS. You control all your data.
              </p>

              <!-- Key Highlights -->
              <div class="space-y-6 mb-8">
                <div
                  v-for="highlight in highlights"
                  :key="highlight.title"
                  class="p-4 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-lg border border-primary/20"
                >
                  <div class="flex items-start gap-3 mb-3">
                    <u-icon
                      :name="highlight.icon"
                      class="w-7 h-7 text-primary flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <h3 class="font-bold text-lg mb-1">
                        {{ highlight.title }}
                      </h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        {{ highlight.description }}
                      </p>
                    </div>
                  </div>
                  <ul class="space-y-2 ml-10">
                    <li
                      v-for="feature in highlight.features"
                      :key="feature"
                      class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <u-icon
                        name="i-heroicons-check-circle"
                        class="w-4 h-4 text-primary flex-shrink-0"
                      />
                      <span>{{ feature }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-4">
                <u-button
                  to="/examples"
                  size="xl"
                  icon="i-heroicons-code-bracket"
                  color="primary"
                >
                  View Examples
                </u-button>
                <u-button
                  to="https://github.com/awesome-comment/awesome-comment"
                  size="xl"
                  icon="i-heroicons-arrow-top-right-on-square"
                  variant="outline"
                  external
                >
                  View on GitHub
                </u-button>
              </div>
            </div>

            <!-- Core Features -->
            <div>
              <h2 class="text-2xl sm:text-3xl font-bold mb-4">
                Why Awesome Comment?
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-6">
                Built for modern websites that value user engagement and global reach
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  v-for="feature in features"
                  :key="feature.title"
                  class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <u-icon
                    :name="feature.icon"
                    class="w-6 h-6 text-primary flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <h3 class="font-semibold mb-1">
                      {{ feature.title }}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ feature.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Start -->
            <div>
              <h2 class="text-2xl sm:text-3xl font-bold mb-6">
                Quick Start
              </h2>
              <div class="space-y-6">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold mb-2">
                      Add the script
                    </h3>
                    <u-card class="bg-gray-900 dark:bg-gray-950">
                      <pre class="text-xs text-gray-100 overflow-x-auto"><code>&lt;script src="https://unpkg.com/@roudanio/awesome-comment@latest/dist/awesome-comment.umd.js"&gt;&lt;/script&gt;</code></pre>
                    </u-card>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold mb-2">
                      Initialize
                    </h3>
                    <u-card class="bg-gray-900 dark:bg-gray-950">
                      <pre class="text-xs text-gray-100 overflow-x-auto"><code>AwesomeComment.init('#comment', {
  postId: 'your-post-id',
  apiUrl: 'https://your-api',
  domain: 'your-domain',
  clientId: 'your-client-id'
});</code></pre>
                    </u-card>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold mb-2">
                      Add container
                    </h3>
                    <u-card class="bg-gray-900 dark:bg-gray-950">
                      <pre class="text-xs text-gray-100 overflow-x-auto"><code>&lt;div id="comment"&gt;&lt;/div&gt;</code></pre>
                    </u-card>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Live Demo -->
          <div class="lg:sticky lg:top-24">
            <u-card class="shadow-xl">
              <template #header>
                <div class="flex items-center gap-2">
                  <u-icon
                    name="i-heroicons-chat-bubble-left-right"
                    class="w-6 h-6 text-primary"
                  />
                  <h2 class="text-xl font-bold">
                    Try It Live!
                  </h2>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  See Awesome Comment in action - leave a comment below
                </p>
              </template>

              <div
                id="comment"
                class="min-h-[400px]"
              />
            </u-card>
          </div>
        </div>
      </div>
    </section>



    <!-- Admin Features -->
    <section class="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">
            Supercharge Your Admin Experience
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            With AI-powered tools, you can engage with users from anywhere in the world,
            in any language, and respond instantly - all from one intuitive dashboard
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <u-card
            v-for="feature in adminFeatures"
            :key="feature.title"
            class="hover:shadow-lg transition-shadow"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0">
                <u-icon
                  :name="feature.icon"
                  class="w-10 h-10 text-primary"
                />
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">
                  {{ feature.title }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </u-card>
        </div>

        <div class="text-center mt-12">
          <div class="inline-block p-6 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-lg border border-primary/20">
            <p class="text-lg font-semibold mb-2">
              🚀 Real Results
            </p>
            <p class="text-gray-600 dark:text-gray-400">
              Users love AI-assisted communication. Experience significantly higher engagement rates
              and more meaningful conversations with your community.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech Stack -->
    <section class="py-16 sm:py-24">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">
            Built for Scale & Performance
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Modern infrastructure that grows with your community
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <u-card
            v-for="tech in techStack"
            :key="tech.title"
            class="hover:shadow-lg transition-shadow"
          >
            <template #header>
              <div class="flex items-center gap-3">
                <u-icon
                  :name="tech.icon"
                  class="w-8 h-8 text-primary"
                />
                <h3 class="text-xl font-semibold">
                  {{ tech.title }}
                </h3>
              </div>
            </template>
            <p class="text-gray-600 dark:text-gray-400">
              {{ tech.description }}
            </p>
          </u-card>
        </div>
      </div>
    </section>



    <!-- Contributors -->
    <section class="py-16 sm:py-24">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">
            Contributors
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Thanks to the amazing people who make this project possible
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-6">
          <u-card
            v-for="contributor in contributors"
            :key="contributor.name"
            class="w-full sm:w-80"
          >
            <div class="flex items-center gap-4">
              <u-avatar
                v-if="contributor.avatar"
                :src="contributor.avatar"
                :alt="contributor.name"
                size="xl"
              />
              <u-avatar
                v-else
                icon="i-heroicons-question-mark-circle"
                size="xl"
              />

              <div class="flex-1">
                <div class="font-bold text-lg mb-2">
                  {{ contributor.name }}
                </div>
                <div class="flex gap-2">
                  <u-button
                    v-if="contributor.github"
                    :to="contributor.github"
                    size="xs"
                    icon="i-heroicons-arrow-top-right-on-square"
                    variant="ghost"
                    external
                  >
                    GitHub
                  </u-button>
                  <u-button
                    v-if="contributor.twitter"
                    :to="contributor.twitter"
                    size="xs"
                    icon="i-heroicons-arrow-top-right-on-square"
                    variant="ghost"
                    external
                  >
                    Twitter
                  </u-button>
                  <u-button
                    v-if="contributor.blog"
                    :to="contributor.blog"
                    size="xs"
                    icon="i-heroicons-arrow-top-right-on-square"
                    variant="ghost"
                    external
                  >
                    Blog
                  </u-button>
                </div>
              </div>
            </div>
          </u-card>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl sm:text-4xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Choose between self-hosting or using our managed SaaS service
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <u-button
              to="/examples"
              size="lg"
              icon="i-heroicons-code-bracket"
              color="primary"
            >
              View Examples
            </u-button>
            <u-button
              to="https://github.com/awesome-comment/awesome-comment/issues"
              size="lg"
              icon="i-heroicons-chat-bubble-left-right"
              variant="outline"
              external
            >
              Report Issues
            </u-button>
            <u-button
              to="https://paypal.me/meathill?country.x=C2&locale.x=zh_XC"
              size="lg"
              icon="i-heroicons-heart"
              variant="outline"
              external
            >
              Support Us
            </u-button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
export default {
  name: 'HomepageIndex',
}
</script>
