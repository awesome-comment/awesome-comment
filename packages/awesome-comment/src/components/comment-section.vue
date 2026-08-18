<script setup lang="ts">
import { computed, inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import useStore from '../store';
import CommentItem from './comment-item.vue';

type Props = {
  maxHeight?: number | string;
};
const props = defineProps<Props>();

const { t } = useI18n();
const store = useStore();
const maxHeightInject = inject<number | string | undefined>('MaxHeight', undefined);

const sectionStyle = computed(() => {
  const maxH = props.maxHeight ?? maxHeightInject;
  if (!maxH) return undefined;
  const height = typeof maxH === 'number' ? `${maxH}px` : maxH;
  return {
    maxHeight: height,
    overflowY: 'auto' as const,
  };
});

function loadMore() {
  store.start += 20;
  store.loadComments();
}

onMounted(() => {
  if (!store.isLoaded) {
    store.loadComments();
  }
});
</script>

<template>
  <div
    v-if="store.isLoaded"
    class="comments-wrapper"
    :style="sectionStyle"
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
