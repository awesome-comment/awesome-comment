<script setup lang="ts">
const year = new Date().getFullYear();
const version = __VERSION__;
const acVersion = __AC_VERSION__;

const socialLinks = [
  {
    label: 'Twitter',
    to: 'https://twitter.com/meathill1',
    icon: 'i-simple-icons-twitter'
  },
  {
    label: 'Facebook',
    to: 'https://facebook.com/meathill',
    icon: 'i-simple-icons-facebook'
  },
  {
    label: 'YouTube',
    to: 'https://www.youtube.com/channel/UCBeD-XqErDK4tKy5FtZj8vg',
    icon: 'i-simple-icons-youtube'
  }
];
</script>

<template>
  <footer class="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 mt-auto">
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <u-avatar
            src="/images/meathill.webp"
            alt="Awesome Comment"
            size="sm"
          />
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <p>Copyright © {{ year }} - All rights reserved</p>
            <p class="text-xs">
              Site v{{ version }} | Awesome Comment v{{ acVersion }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <u-button
            v-for="link in socialLinks"
            :key="link.label"
            :to="link.to"
            :icon="link.icon"
            :aria-label="link.label"
            variant="ghost"
            size="sm"
            external
          />
        </div>
      </div>
    </div>
  </footer>
</template>
