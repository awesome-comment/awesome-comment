<script setup lang="ts">
import useStore from '../store';
import { formatTime } from '../utils/time.ts';
import { CommentStatus } from '@awesome-comment/core/data';

const store = useStore();
store.loadComments();

function loadMore() {
  store.start += 20;
  store.loadComments();
}
</script>

<template lang="pug">
.comments-wrapper(v-if="store.isLoaded")
  article.p-6.text-base.bg-base-200.rounded-lg.mb-4(
    v-for="comment in store.comments"
    :key="comment.id"
    class="dark:bg-gray-900"
    :class="{'animated flash': comment.isNew}"
    @animationend="comment.isNew = false"
  )
    footer.flex.justify-between.items-center.mb-2
      .flex.items-center.text-sm.text-base-content(
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
    p.italic.mt-4.text-gray-500.mb-0.text-sm(
      v-if="comment.status === CommentStatus.Pending"
      class="dark:text-gray-400"
    ) comments normally got approved within 24 hours

  button.ac-btn.ac-btn-neutral.ac-btn-sm.ac-btn-block(
    v-if="store.hasMore"
    type="button"
    @click="loadMore"
    :disabled="store.loadingMore"
  )
    span.ac-loading.ac-loading-xs.ac-loading-spinner(v-if="store.loadingMore")
    | Load More
.pt-8.text-center(v-else)
  span.ac-loading.ac-loading-spinner
</template>

<script lang="ts">
export default {
  name: 'CommentSections',
}
</script>
