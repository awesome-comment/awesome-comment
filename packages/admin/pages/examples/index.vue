<script lang="ts" setup>
useSeoMeta({
  title: 'Examples - Awesome Comment',
  description:
    'Explore examples and integration guides for Awesome Comment. Learn how to implement AI-powered comments with auto-translation and seamless authentication.',
  ogTitle: 'Examples - Awesome Comment',
  ogDescription:
    'Explore integration examples for AI-powered comment system with auto-translation and Google One Tap login.',
});

const examples = [
  {
    title: 'Preload',
    description: 'Create comment after preload, no CLS',
    to: '/examples/preload',
  },
];
const route = useRoute();
</script>
<template>
  <main class="container max-w-6xl mx-auto py-4">
    <h2 class="text-3xl font-bold mb-4">
      Examples
    </h2>
    <div class="grid grid-cols-3 gap-4">
      <nuxt-link
        v-for="item in examples"
        :key="item.to"
        class="bg-base-200 flex flex-col justify-center items-center min-h-32 px-8 rounded hover:bg-primary/10 hover:shadow-sm"
        :to="item.to"
      >
        <h3 class="text-2xl font-bold mb-4">
          {{ item.title }}
        </h3>
        <p>{{ item.description }}</p>
      </nuxt-link>
    </div>
  </main>
</template>

<script lang="ts">
export default {
  name: 'ExamplesIndex'
}
</script>
