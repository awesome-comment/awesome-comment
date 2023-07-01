<script setup lang="ts">
import CommentForm from "./components/comment-form.vue";
import CommentSection from "./components/comment-section.vue";

const params = new URL(location.href).searchParams;
const postId = params.get("postId");
const postTitle = params.get("postTitle") || document.title;

</script>

<template lang="pug">
main.container.mx-auto
  .flex.justify-between.items-center.mb-6
    h2.text-lg.font-bold.text-gray-900(
      class="lg:text-2xl dark:text-white"
    ) Discussion (20)

  comment-form
  comment-section
</template>
