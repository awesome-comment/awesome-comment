<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import CommentItem from './comment-item.vue';
import useStore from '../store';

const { t } = useI18n();
const store = useStore();

function loadMore() {
  store.start += 20;
  store.loadComments();
}

onMounted(() => {
  if (!store.isLoaded) {
    store.loadComments();
  }
})
</script>

<template>
  <div
    v-if="store.isLoaded"
    class="comments-wrapper"
  >
    <comment-item
      v-for="comment in Object.values(store.comments).reverse()"
      :key="comment.id"
      :ancestor-id="comment.id"
      :comment="comment"
      :parent-id="comment.parentId"
      is-first-level
    />
    <button
      v-if="store.hasMore"
      :disabled="store.loadingMore"
      class="ac-btn h-11 min-h-fit ac-btn-block text-white border-0 bg-green-middle hover:bg-green-middle/75 hover:text-white"
      type="button"
      @click="loadMore"
    >
      <span
        v-if="store.loadingMore"
        class="ac-loading ac-loading-xs ac-loading-spinner"
      />
      {{ t('load_more') }}
    </button>
  </div>
  <div
    v-else
    class="py-8 text-center"
  >
    <span class="ac-loading ac-loading-spinner text-base-content" />
  </div>
</template>

<script lang="ts">
export default {
  name: 'CommentSections',
}
</script>
