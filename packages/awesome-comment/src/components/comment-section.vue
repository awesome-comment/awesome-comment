<script setup lang="ts">
import useStore from '../store';

const store = useStore();
store.loadComments();
</script>

<template lang="pug">
article.p-6.mb-6.text-base.bg-white.rounded-lg(
  v-for="comment in store.comments"
  :key="comment.id"
  class="dark:bg-gray-900"
)
  footer.flex.justify-between.items-center.mb-2
    .flex.items-center
      p.inline-flex.items-center.mr-3.text-sm.text-gray-900(
        class="dark:text-white"
      )
        img.mr-2.w-6.h-6.rounded-full(
          :src="comment.avatar"
          :alt="comment.userName"
        )
        | {{comment.userName}}
      p.text-sm.text-gray-600(
        class="dark:text-gray-400"
      )
        time(
          pubdate
          :datetime="comment.createdAt"
          :title="comment.createdAt"
        ) {{comment.createdAt}}

  p.text-gray-500(
    class="dark:text-gray-400"
  ) {{comment.content}}
</template>

<script lang="ts">
export default {
  name: 'CommentSections',
}
</script>
