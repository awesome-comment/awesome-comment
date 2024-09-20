<script lang="ts" setup>
useHead({
  titleTemplate: '%s - Awesome Comment',
});
</script>

<template>
<nuxt-loading-indicator />
<nuxt-layout>
  <nuxt-page />
</nuxt-layout>
<u-notification />
</template>
