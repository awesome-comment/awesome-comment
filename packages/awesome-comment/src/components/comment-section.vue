<script setup lang="ts">
import CommentItem from './comment-item.vue';
import useStore from '../store';

const store = useStore();
store.loadComments();

function loadMore() {
  store.start += 20;
  store.loadComments();
}
</script>

<template lang="pug">
.comments-wrapper(v-if="store.isLoaded")
  comment-item(
    v-for="comment in store.comments"
    :key="comment.id"
    :comment="comment"
    :ancestor-id="Number(comment.id)"
    is-first-level
  )

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
