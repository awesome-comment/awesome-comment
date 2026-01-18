<script setup lang="ts">
const links = [
  {
    label: 'Examples',
    to: '/examples',
    icon: 'i-heroicons-code-bracket',
  },
  {
    label: 'GitHub',
    to: 'https://github.com/awesome-comment/awesome-comment',
    icon: 'i-heroicons-arrow-top-right-on-square',
    external: true,
  },
  {
    label: 'Admin',
    to: '/admin',
    icon: 'i-heroicons-cog-6-tooth',
  },
];
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/75 dark:bg-gray-950/75 backdrop-blur">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-8">
          <nuxt-link
            to="/"
            class="text-xl font-bold hover:text-primary transition-colors"
          >
            Awesome Comment
          </nuxt-link>
          
          <nav class="hidden md:flex items-center gap-1">
            <u-button
              v-for="link in links.slice(0, 1)"
              :key="link.label"
              :to="link.to"
              :icon="link.icon"
              variant="ghost"
              size="sm"
            >
              {{ link.label }}
            </u-button>
          </nav>
        </div>

        <div class="flex items-center gap-1">
          <u-button
            v-for="link in links.slice(1)"
            :key="link.label"
            :to="link.to"
            :icon="link.icon"
            :external="link.external"
            variant="ghost"
            size="sm"
          >
            <span class="hidden sm:inline">{{ link.label }}</span>
          </u-button>
        </div>
      </div>
    </div>
  </header>
</template>
