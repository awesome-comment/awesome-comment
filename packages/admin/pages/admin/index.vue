<script setup lang="ts">
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';

type RowItem = Comment & {
  reviewing: boolean;
}

const message = ref<string>('');
const filterStatus = ref<string>('all');
const CSKeys = Object.values(CommentStatus).filter((v) => !isNaN(Number(v)));

const { data: comments, pending } = await useAsyncData<RowItem[]>(
  'comments',
  async function () {
    const { data } = await $fetch('/api/admin/comments', {
      query: {
        status: filterStatus.value === 'all' ? ['0' ,'1'] : filterStatus.value,
        start: 0,
      },
    });
    return (data || []).map(c => {
      c.user = JSON.parse((c.user || '{}') as string);
      c.status = Number(c.status);
      c.id = Number(c.id);
      c.reviewing = false;
      return c;
    });
  },
  {
    watch: [filterStatus],
  }
);

async function doReview(comment: RowItem, status: CommentStatus) {
  comment.reviewing = true;
  await $fetch('/api/admin/comment/' + comment.id, {
    method: 'PATCH',
    body: {
      id: comment.id,
      status,
    }
  });
  comment.status = status;
  comment.reviewing = false;
}
async function doDelete(comment: RowItem, index: number): Promise<void> {
  if (!confirm('Are you sure to delete this comment?')) { return }
  comment.reviewing = true;
  await $fetch('/api/admin/comment/' + comment.id, {
    method: 'DELETE',
  });
  comments.value.splice(index, 1);
  comment.reviewing = false;
}
</script>

<template lang="pug">
main.container.mx-auto.py-8
  header.flex.items-center.mb-4
    h1.text-2xl.font-bold Comments Management

  .overflow-x-auto
    table.table.table-pin-rows.table-pin-cols
      thead
        tr
          td ID
          td Content
          td User
          td Time
          td Post
          td.form-control.w-full.max-w-xs
            label.label
              span.text-xs Status
            select.select.select-bordered.select-sm(v-model="filterStatus")
              option(value="all") All
              option(v-for="key in CSKeys", :value="key", :key="key") {{ CommentStatus[key] }}
          td
      tbody(v-if="comments.length && !pending")
        tr(v-for="(comment, index) in comments" :key="comment.id")
          td {{ comment.id }}
          td {{ comment.content }}
          td
            user-cell(:user="comment.user")
          td {{ comment.created_at }}
          td {{ comment.post_id }}
          td {{ CommentStatus[comment.status] }}
          th
            .flex.flex-wrap.gap-2
              button.btn.btn-outline.btn-success.btn-xs(
                v-if="comment.status === CommentStatus.Pending || comment.status === CommentStatus.Rejected"
                type="button",
                :disabled="comment.reviewing",
                @click="doReview(comment, CommentStatus.Approved)"
              )
                span.loading.loading-xs.loading-spinner(v-if="comment.reviewing")
                | Approve
              button.btn.btn-outline.btn-warning.btn-xs(
                v-if="comment.status === CommentStatus.Pending || comment.status === CommentStatus.Approved"
                type="button",
                :disabled="comment.reviewing",
                @click="doReview(comment, CommentStatus.Rejected)"
              )
                span.loading.loading-xs.loading-spinner(v-if="comment.reviewing")
                | Reject
              button.btn.btn-outline.btn-error.btn-xs(
                type="button",
                :disabled="comment.reviewing",
                @click="doDelete(comment, index)"
              )
                span.loading.loading-xs.loading-spinner(v-if="comment.reviewing")
                | Delete

    .w-full.h-32.flex.items-center.justify-center(v-if="pending")
      .loading.loading-ring.loading-lg
    .w-full.h-32.flex.items-center.justify-center(v-else-if="comments.length === 0")
      .text-lg.text-center.text-neutral-content No Data to display
</template>

<script lang="ts">
export default {
  name: 'AdminIndexPage',
}
</script>
