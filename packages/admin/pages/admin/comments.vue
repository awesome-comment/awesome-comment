<script setup lang="ts">
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { useAuth0 } from '@auth0/auth0-vue';

type RowItem = Comment & {
  isReviewing: boolean;
  isReplying: boolean;
  from: string;
}

const auth0 = process.client ? useAuth0() : undefined;

const start = ref<number>(0);
const hasMore = ref<boolean>(false);
const loadingMore = ref<boolean>(false);
const message = ref<string>('');
const filterStatus = ref<CommentStatus | 'all'>(CommentStatus.Pending);
const CSKeys = Object.values(CommentStatus).filter((v) => !isNaN(Number(v)));
const comments = ref<RowItem[]>([]);

definePageMeta({
  middleware: ['auth'],
});

const { data, pending } = await useAsyncData(
  'comments',
  async function () {
    if (!auth0) return;

    const token = await auth0.getAccessTokenSilently();
    const { data } = await $fetch('/api/admin/comments', {
      query: {
        status: filterStatus.value === 'all' ? ['0' ,'1'] : filterStatus.value,
        start: start.value,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    hasMore.value = data?.length === 20;
    const cms = (data || []).map(c => {
      c.user = JSON.parse((c.user || '{}') as string);
      c.status = Number(c.status);
      c.id = Number(c.id);
      c.isReviewing = false;
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

async function doReview(comment: RowItem, status: CommentStatus) {
  if (!auth0) return;

  comment.isReviewing = true;
  const token = await auth0.getAccessTokenSilently();
  await $fetch('/api/admin/comment/' + comment.id, {
    method: 'PATCH',
    body: {
      postId: comment.postId,
      status,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  comment.status = status;
  comment.isReviewing = false;
}
async function doDelete(comment: RowItem, index: number): Promise<void> {
  if (!auth0) return;
  if (!confirm('Are you sure to delete this comment?')) { return }

  comment.isReviewing = true;
  const token = await auth0.getAccessTokenSilently();
  await $fetch('/api/admin/comment/' + comment.id, {
    method: 'DELETE',
    body: {
      postId: comment.postId,
      statue: comment.status,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  comments.value.splice(index, 1);
  comment.isReviewing = false;
}
function doLoadMore() {
  start.value += 20;
}
function onFilterChange(): void {
  comments.value.length = 0;
}
</script>

<template lang="pug">
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
              :disabled="comment.isReviewing || loadingMore",
              @click="doReview(comment, CommentStatus.Approved)"
            )
              span.loading.loading-xs.loading-spinner(v-if="comment.isReviewing")
              | Approve
            button.btn.btn-outline.btn-warning.btn-sm(
              v-if="comment.status === CommentStatus.Pending || comment.status === CommentStatus.Approved"
              type="button",
              class="sm:btn-xs"
              :disabled="comment.isReviewing || loadingMore",
              @click="doReview(comment, CommentStatus.Rejected)"
            )
              span.loading.loading-xs.loading-spinner(v-if="comment.isReviewing")
              | Reject
            button.btn.btn-outline.btn-error.btn-sm(
              type="button",
              class="sm:btn-xs"
              :disabled="comment.isReviewing || loadingMore",
              @click="doDelete(comment, index)"
            )
              span.loading.loading-xs.loading-spinner(v-if="comment.isReviewing")
              | Delete

            reply-comment(
              :comment="comment"
            )
  button.mt-2.btn.btn-neutral.btn-sm.btn-block(
    v-if="hasMore",
    type="button",
    :disabled="loadingMore",
    @click="doLoadMore",
  )
    span.loading.loading-xs.loading-spinner(v-if="loadingMore")
    | Load More

  .w-full.h-32.flex.items-center.justify-center(v-if="pending")
    span.loading.loading-spinner
  .w-full.h-32.flex.items-center.justify-center(v-else-if="comments.length === 0")
    .text-lg.text-center.text-neutral-content No Data to display
</template>

<script lang="ts">
export default {
  name: 'AdminCommentsPage',
}
</script>
