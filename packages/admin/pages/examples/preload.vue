<script setup lang="ts">
useSeoMeta({
  title: 'Preload Example - Awesome Comment',
  description:
    'Learn how to preload Awesome Comment to avoid Cumulative Layout Shift (CLS) and improve user experience.',
  robots: 'noindex, follow',
});

useHead({
  script: [
    {
      src: __REPO_URL__ + '/awesome-comment.umd.js',
      crossorigin: 'anonymous',
      async: true,
    },
  ],
});

const isLoaded = ref<boolean>(false);
const isPreloading = ref<boolean>(false);
const isPreloaded = ref<boolean>(false);

function initAwesomeComment(): void {
  if (!window.AwesomeComment) {
    setTimeout(initAwesomeComment, 100);
    return;
  }
  isLoaded.value = true;
}
async function doPreload(): Promise<void> {
  isPreloading.value = true;
  await AwesomeComment.preload('awesome-comment-self', '', __AUTH0_DOMAIN__, __AUTH0_CLIENT_ID__);
  isPreloading.value = false;
  isPreloaded.value = true;
}
function doStart(): void {
  return AwesomeComment.init('#awesome-comment', 'awesome-comment-self', '', __AUTH0_DOMAIN__, __AUTH0_CLIENT_ID__);
}
onMounted(initAwesomeComment);
</script>

<template lang="pug">
main.w-full.max-w-xl.mx-auto.py-4
  header.flex.gap-2.mb-4
    button.btn.btn-primary(
      type="button"
      :disabled="!isLoaded || isPreloading || isPreloaded"
      @click="doPreload"
    )
      span.loading.loading-spinner(v-if="isPreloading")
      | Preload
    button.btn.btn-secondary(
      type="button"
      :disabled="!isPreloaded"
      @click="doStart"
    ) Init

  #awesome-comment.h-16
</template>

<script lang="ts">
export default {
  name: 'ExamplesPreload',
}
</script>
