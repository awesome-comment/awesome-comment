<script setup lang="ts">
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';

type RowItem = Comment & {
  reviewing: boolean;
  from: string;
}
const start = ref<number>(0);
const hasMore = ref<boolean>(false);
const loadingMore = ref<boolean>(false);
const message = ref<string>('');
const filterStatus = ref<string>('all');
const CSKeys = Object.values(CommentStatus).filter((v) => !isNaN(Number(v)));
const comments = ref<RowItem[]>([]);

const { data, pending } = await useAsyncData(
  'comments',
  async function () {
    const { data } = await $fetch('/api/admin/comments', {
      query: {
        status: filterStatus.value === 'all' ? ['0' ,'1'] : filterStatus.value,
        start: start.value,
      },
    });
    hasMore.value = data?.length === 20;
    const cms = (data || []).map(c => {
      c.user = JSON.parse((c.user || '{}') as string);
      c.status = Number(c.status);
      c.id = Number(c.id);
      c.reviewing = false;
      c.from = c.user_id.split('|')[ 0 ];
      return c;
    });
    comments.value.push(...cms);
    return comments;
  },
  {
    watch: [filterStatus, start],
  }
);

function loadMore() {
  start.value += 20;
}

async function doReview(comment: RowItem, status: CommentStatus) {
  comment.reviewing = true;
  await $fetch('/api/admin/comment/' + comment.id, {
    method: 'PATCH',
    body: {
      postId: comment.postId,
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
    body: {
      postId: comment.postId,
      statue: comment.status,
    },
  });
  comments.value.splice(index, 1);
  comment.reviewing = false;
}
function onFilterChange(): void {
  comments.value.length = 0;
}
</script>

<template lang="pug">
main.container.mx-auto.p-4(class="sm:px-0 sm:py-8")
  header.flex.flex-col.mb-4.gap-4(class="sm:flex-row sm:items-center")
    h1.text-2xl.font-bold Comments Management
    .form-control.flex-row.gap-2(class="sm:ml-auto")
      label.label
        span.text-xs Status
      select.select.select-bordered.select-sm(
        v-model="filterStatus"
        @change="onFilterChange"
      )
        option(value="all") All
        option(v-for="key in CSKeys", :value="key", :key="key") {{ CommentStatus[key] }}

  .overflow-x-auto
    table.table.table-pin-rows.table-pin-cols
      thead
        tr
          th ID
          th Content
          th User
          th Time
          th Post
          th Status
          th
      tbody(v-if="comments.length && !pending")
        tr(v-for="(comment, index) in comments" :key="comment.id")
          td {{ comment.id }}
          td {{ comment.content }}
          td
            user-cell(
              :user="comment.user"
              :from="comment.from"
            )
          td {{ comment.created_at }}
          td {{ comment.post_id }}
          td {{ CommentStatus[comment.status] }}
          th
            .flex.flex-wrap.gap-2
              button.btn.btn-outline.btn-success.btn-sm(
                v-if="comment.status === CommentStatus.Pending || comment.status === CommentStatus.Rejected"
                type="button"
                class="sm:btn-xs"
                :disabled="comment.reviewing || loadingMore",
                @click="doReview(comment, CommentStatus.Approved)"
              )
                span.loading.loading-xs.loading-spinner(v-if="comment.reviewing")
                | Approve
              button.btn.btn-outline.btn-warning.btn-sm(
                v-if="comment.status === CommentStatus.Pending || comment.status === CommentStatus.Approved"
                type="button",
                class="sm:btn-xs"
                :disabled="comment.reviewing || loadingMore",
                @click="doReview(comment, CommentStatus.Rejected)"
              )
                span.loading.loading-xs.loading-spinner(v-if="comment.reviewing")
                | Reject
              button.btn.btn-outline.btn-error.btn-sm(
                type="button",
                class="sm:btn-xs"
                :disabled="comment.reviewing || loadingMore",
                @click="doDelete(comment, index)"
              )
                span.loading.loading-xs.loading-spinner(v-if="comment.reviewing")
                | Delete

    button.mt-2.btn.btn-neutral.btn-sm.btn-block(
      v-if="hasMore",
      type="button",
      :disabled="loadingMore",
      @click="loadMore",
    )
      span.loading.loading-xs.loading-spinner(v-if="loadingMore")
      | Load More

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
