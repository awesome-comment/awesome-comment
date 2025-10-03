<script lang="ts" setup>
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
