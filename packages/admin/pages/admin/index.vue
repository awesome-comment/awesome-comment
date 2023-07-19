<script setup lang="ts">
import { CommentStatus } from '@awesome-comment/core/data';
const message = ref<string>('');

const { data, pending } = await useFetch('/api/admin/comments', {
  query: {
    status: 0,
    start: 0,
  },
  default() {
    return { data: [] };
  }
});

const comments = computed(() => {
  return data.value.data?.map(c => {
    c.user = JSON.parse((c.user || '{}') as string);
    c.status = Number(c.status);
    return c;
  });
});

const statusText = (status: CommentStatus) => {
  switch (status) {
    case CommentStatus.Pending:
      return 'Pending';
    case CommentStatus.Approved:
      return 'Approved';
    case CommentStatus.Rejected:
      return 'Rejected';
    case CommentStatus.Deleted:
      return 'Deleted';
  }
}
</script>

<template lang="pug">
main.container.mx-auto.py-8
  header.flex.items-center.mb-4
    h1.text-2xl.font-bold Pending Comments

  .loading.loading-ring.loading-lg(v-if="pending")
  .overflow-x-auto(v-else-if="data.data.length")
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
          td {{ statusText(comment.status) }}
          th
            .flex.flex-wrap.gap-2(v-if="comment.status === CommentStatus.Pending")
              button.btn.btn-outline.btn-success.btn-xs Approve
              button.btn.btn-outline.btn-warning.btn-xs Reject
              button.btn.btn-outline.btn-error.btn-xs Delete
</template>

<script lang="ts">
export default {
  name: 'AdminIndexPage',
}
</script>
