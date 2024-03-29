<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CommentItem from './comment-item.vue';
import useStore from '../store';

const { t } = useI18n();
const store = useStore();
store.loadComments(true);

function loadMore() {
  store.start += 20;
  store.loadComments();
}
</script>

<template lang="pug">
.comments-wrapper(v-if="store.isLoaded")
  comment-item(
    v-for="comment in Object.values(store.comments).reverse()"
    :key="comment.id"
    :comment="comment"
    :parent-id="comment.parentId"
    :ancestor-id="comment.id"
    is-first-level
  )

  button.ac-btn.h-11.min-h-fit.ac-btn-block.text-white.border-0.bg-green-middle(
    v-if="store.hasMore"
    class="hover:bg-green-middle/75"
    type="button"
    @click="loadMore"
    :disabled="store.loadingMore"
  )
    span.ac-loading.ac-loading-xs.ac-loading-spinner(v-if="store.loadingMore")
    | {{t('load_more')}}
.pt-8.text-center(v-else)
  span.ac-loading.ac-loading-spinner
</template>

<script lang="ts">
export default {
  name: 'CommentSections',
}
</script>
