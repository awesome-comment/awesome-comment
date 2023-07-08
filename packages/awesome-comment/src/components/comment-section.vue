<script setup lang="ts">
import useStore from '../store';
import { formatTime } from '../utils/time.ts';

const store = useStore();
store.loadComments();
</script>

<template lang="pug">
.comments-wrapper(v-if="store.isLoaded")
  article.p-6.mb-6.text-base.bg-white.rounded-lg(
    v-for="comment in store.comments"
    :key="comment.id"
    class="dark:bg-gray-900"
  )
    footer.flex.justify-between.items-center.mb-2
      .flex.items-center.text-sm.text-gray-900(
        class="dark:text-white"
      )
        img.mr-2.w-6.h-6.rounded-full(
          :src="comment.user.avatar"
          :alt="comment.user.name"
        )
        | {{comment.user.name}}
        time.text-xs.text-gray-600.ml-4(
          class="dark:text-gray-400"
          pubdate
          :datetime="comment.createdAt"
          :title="comment.createdAt"
        ) {{formatTime(comment.createdAt)}}

    p.text-gray-500(
      class="dark:text-gray-400"
    ) {{comment.content}}
.pt-8.text-center(v-else)
  span.loading.loading-spinner
</template>

<script lang="ts">
export default {
  name: 'CommentSections',
}
</script>
