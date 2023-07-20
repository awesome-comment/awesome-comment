<script setup lang="ts">
import { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
const message = ref<string>('');

const { data, pending } = await useAsyncData('comments',
  () => $fetch('/api/admin/comments', {
    query: {
      status: 0,
      start: 0,
    },
  }),
);

const comments = computed(() => {
  return (data.value?.data || []).map(c => {
    c.user = JSON.parse((c.user || '{}') as string);
    c.status = Number(c.status);
    c.id = Number(c.id);
    c.reviewing = false;
    return c;
  });
});

async function review(comment: Comment, status: CommentStatus) {
  comment.reviewing = true;
  await $fetch('/api/admin/review', {
    method: 'POST',
    body: {
      id: comment.id,
      status,
    }
  });
  comment.status = status;
  comment.reviewing = false;
}
</script>

<template lang="pug">
main.container.mx-auto.py-8
  header.flex.items-center.mb-4
    h1.text-2xl.font-bold Pending Comments

  .loading.loading-ring.loading-lg(v-if="pending")
  .overflow-x-auto(v-else-if="data.data?.length")
    table.table.table-pin-rows.table-pin-cols
      thead
        tr
          th
          td ID
          td Content
          td User
          td Time
          td Post
          td Status
          th
      tbody
        tr(v-for="comment in comments" :key="comment.id")
          th
          td {{ comment.id }}
          td {{ comment.content }}
          td
            user-cell(:user="comment.user")
          td {{ comment.created_at }}
          td {{ comment.post_id }}
          td {{ CommentStatus[comment.status] }}
          th
            .flex.flex-wrap.gap-2(v-if="comment.status === CommentStatus.Pending")
              button.btn.btn-outline.btn-success.btn-xs(
                type="button",
                :disabled="reviewing",
                @click="review(comment, CommentStatus.Approved)"
              )
                span.loading.loading-xs.loading-spinner(v-if="reviewing")
                | Approve
              button.btn.btn-outline.btn-warning.btn-xs(
                type="button",
                :disabled="reviewing",
                @click="review(comment, CommentStatus.Rejected)"
              )
                span.loading.loading-xs.loading-spinner(v-if="reviewing")
                | Reject
              button.btn.btn-outline.btn-error.btn-xs(
                type="button",
                :disabled="reviewing",
                @click="review(comment, CommentStatus.Deleted)"
              )
                span.loading.loading-xs.loading-spinner(v-if="reviewing")
                | Delete
</template>

<script lang="ts">
export default {
  name: 'AdminIndexPage',
}
</script>
