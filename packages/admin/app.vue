<script lang="ts" setup>
useHead({
  titleTemplate: '%s - Awesome Comment',
});
</script>

<template>
  <div>
    <nuxt-loading-indicator />
    <nuxt-layout>
      <nuxt-page />
    </nuxt-layout>
    
    <u-notifications />
  </div>
</template>
