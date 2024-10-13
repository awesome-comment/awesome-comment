<script setup lang="ts">
import type { Comment } from '@awesome-comment/core/types';
import { useI18n } from 'vue-i18n';
import useStore from '../store';
import { marked } from 'marked';

type Props = {
  ancestorId: number;
  comment: Comment;
}
const props = defineProps<Props>();

const { t } = useI18n();
const store = useStore();

function getHtml(content: string): string {
  return (marked(content) as string)
    .replace(/<a/g, '<a target="_blank"');
}
function getParentUserName(id: number): string {
  if (props.ancestorId) {
    const ancestor = store.comments[ props.ancestorId ];
    const parent = ancestor?.children?.find((c) => Number(c.id) === Number(id));
    return parent?.isAdmin ? t('admin') : (parent?.user?.name || parent?.user?.email || '');
  }
  return '';
}
</script>

<template>
  <template v-if="comment.isAdmin">
    <a
      v-if="comment.parentId &amp;&amp; comment.parentId !== comment.ancestorId"
      :href="`#awcm-${comment.parentId}`"
      class="inline-block px-2 py-1 rounded-lg mt-2 bg-base-300 text-gray-500 dark:bg-neutral-400/20 dark:text-gray-400"
      target="_self"
    >@{{ getParentUserName(comment.parentId) }}</a>
    <article
      class="text-gray-500 break-words overflow-x-auto dark:text-gray-400"
      v-html="getHtml(comment.content)"
    />
  </template>
  <p
    v-else
    class="text-gray-500 break-words overflow-x-auto whitespace-pre-line pb-3 mb-0 dark:text-gray-400"
  >
    <a
      v-if="comment.parentId &amp;&amp; comment.parentId !== comment.ancestorId"
      :href="`#awcm-${comment.parentId}`"
      class="inline-block px-2 py-1 rounded-lg me-1 bg-base-300 text-gray-500 dark:bg-neutral-400/20 dark:text-gray-400"
      target="_self"
    >@{{ getParentUserName(comment.parentId) }}</a>{{ comment.content }}
  </p>
</template>
