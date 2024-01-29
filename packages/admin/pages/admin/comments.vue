<script setup lang="ts">
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { useAuth0 } from '@auth0/auth0-vue';

type RowItem = Comment & {
  isReviewing: boolean;
  isReplying: boolean;
  from: string;
}

const postIdPrefix = __POST_ID_PREFIX__;
const CSKeys = Object.values(CommentStatus).filter((v) => !isNaN(Number(v)));
const auth0 = process.client ? useAuth0() : undefined;
const route = useRoute();

const start = ref<number>(0);
const hasMore = ref<boolean>(false);
const loadingMore = ref<boolean>(false);
const message = ref<string>('');
const filterStatus = ref<CommentStatus | 'all'>(route.query.status || CommentStatus.UnReplied);
const filterPostId = ref<string>(route.query.post_id || '');
const comments = ref<Record<number, RowItem>>({});

definePageMeta({
  middleware: ['auth'],
});

const { data: commentsList, pending, refresh } = await useAsyncData(
  'comments',
  async function () {
    if (!auth0) return;
    if (!auth0.isAuthenticated.value) {
      message.value = 'Sorry, you must login first.'
      return;
    }

    const token = await auth0.getAccessTokenSilently();
    const { data, meta } = await $fetch('/api/admin/comments', {
      query: {
        status: filterStatus.value === 'all' ? null : filterStatus.value,
        postId: filterPostId.value,
        start: start.value,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { adminEmails = [] } = meta.config;
    const [cms, replies]: [Record<number, Comment>, Comment[]] = (data || []).reduce(([map, replies], c) => {
      c.user = JSON.parse((c.user || '{}') as string);
      c.toUser = c.toUser ? JSON.parse(c.toUser) : null,
      c.status = Number(c.status);
      c.id = Number(c.id);
      c.isReviewing = false;
      c.from = c.user_id.split('|')[ 0 ];
      c.postId = c.post_id;
      c.parentId = Number(c.parent_id);
      c.ancestorId = Number(c.ancestor_id);
      if (adminEmails.includes(c.user.email) && c.parentId) {
        replies.push(c);
      } else {
        map[ c.id ] = c;
      }
      return [map, replies];
    }, [{}, []]);
    hasMore.value = data.length >= 20;
    for (const reply of replies) {
      const parent = cms[ reply.parent_id ];
      if (!parent) continue;
      parent.children = parent.children ?? [];
      parent.children.push(reply);
    }
    Object.assign(comments.value, cms);
    loadingMore.value = false;
    return Object.values(comments.value).reverse();
  },
  {
    default() {
      return Object.values(comments.value).reverse();
    },
    watch: [filterStatus, filterPostId, start],
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
async function doDelete(comment: RowItem): Promise<void> {
  if (!auth0) return;
  if (!confirm('Are you sure to delete this comment?')) { return }

  comment.isReviewing = true;
  const token = await auth0.getAccessTokenSilently();
  await $fetch('/api/admin/comment/' + comment.id, {
    method: 'DELETE',
    body: {
      postId: comment.postId,
      status: comment.status,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const index = commentsList.value.findIndex((c) => c.id === comment.id);
  if (index > -1) {
    commentsList.value.splice(index, 1);
  }
  delete comments.value[ comment.id ];
  comment.isReviewing = false;
}
function doLoadMore() {
  loadingMore.value = true;
  start.value += 20;
}
function doFilter(postId: string): void {
  filterPostId.value = postId;
  updateUrl();
}
function doRemoveFilterPostId(): void {
  filterPostId.value = '';
  updateUrl();
}
function onStatusChange(): void {
  updateUrl();
}
function onReply(reply: Comment, parent: Comment): void {
  parent.children ??= [];
  parent.children.push(reply);
  // replied comment will be auto approved
  parent.status = CommentStatus.Approved;
}
function doRefresh(): void {
  comments.value = {};
  refresh();
}
function updateUrl(): void {
  comments.value = {};
  commentsList.value = [];
  start.value = 0;
  hasMore.value = false;
  const query: { status?: CommentStatus | 'all', post_id: string} = {};
  if (filterStatus.value !== 'all') {
    query.status = filterStatus.value;
  }
  if (filterPostId) {
    query.post_id = filterPostId.value;
  }
  const router = useRouter();
  router.push({ query });
}
</script>

<template lang="pug">
header.flex.flex-col.mb-4.gap-4(class="sm:flex-row sm:items-center")
  h1.text-2xl.font-bold(class="sm:me-auto") Comments Management
  button.btn.btn-sm.me-2(
    v-if="filterStatus >= CommentStatus.UnReplied"
    type="button"
    :disabled="pending"
    @click="doRefresh"
  )
    span.loading.loading-spinner(v-if="pending")
    i.bi.bi-arrow-clockwise(v-else)
    | Refresh
  .form-control.flex-row.gap-2
    label.label
      span.text-xs Status
    select.select.select-bordered.select-sm(
      v-model="filterStatus"
      @change="onStatusChange"
    )
      option(value="all") All
      option(v-for="key in CSKeys", :value="key", :key="key") {{ CommentStatus[key] }}

.alert.alert-error.mb-4(v-if="message")
  p
    i.bi.bi-exclamation-triangle-fill.mr-2
    | {{ message }}

.flex.mb-4(v-if="filterPostId")
  button.btn.btn-outline.btn-sm.normal-case(
    type="button"
    @click="doRemoveFilterPostId"
  )
    i.bi.bi-funnel-fill
    | {{filterPostId}}
    i.bi.bi-x-lg

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
    tbody(v-if="commentsList?.length")
      tr(v-for="(comment, index) in commentsList" :key="comment.id")
        td {{ comment.id }}
        td
          blockquote.ps-2.border-s-4.mb-2(
            v-if="Number(filterStatus) === CommentStatus['Replied to Admin']"
          )
            p.mb-2 {{comment.toContent}}
            p.text-xs(
              v-if="comment.toUser"
              class="text-base-content/50"
            ) - {{comment.toUser.name || comment.toUser.email}}
          p.break-words.max-w-sm.overflow-hidden {{ comment.content }}
          .mt-4.chat.chat-end(
            v-if="comment.children?.length"
          )
            .chat-header
              edit-comment(
                button-class=""
                :comment="comment.children[0]"
                @save="comment.children[0].content = $event"
              )
            .chat-bubble {{comment.children[0].content}}
            .chat-footer.mt-1
              i.bi.bi-patch-check-fill.me-1
              | {{comment.children[0].user.email}}
        td
          user-cell(
            :user="comment.user"
            :from="comment.from"
          )
        td
          time.text-xs(:datetime="comment.created_at") {{ comment.created_at }}
        td {{ comment.postId.replace(postIdPrefix, '') }}
          .flex.gap-2.mt-2
            button.btn.btn-xs.btn-ghost(
              type="button"
              @click="doFilter(comment.postId)"
            )
              i.bi.bi-funnel-fill
            nuxt-link.btn.btn-xs.btn-ghost(
              target="_blank"
              external
              :to="comment.post_id"
            )
              i.bi.bi-box-arrow-up-right
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
              @click="doDelete(comment)"
            )
              span.loading.loading-xs.loading-spinner(v-if="comment.isReviewing")
              | Delete

            reply-comment(
              :comment="comment"
              @reply="onReply($event, comment)"
            )
            edit-comment(
              :comment="comment"
              @save="comment.content = $event"
            )
  button.mt-2.btn.btn-neutral.btn-sm.btn-block(
    v-if="filterStatus <= CommentStatus.Rejected && hasMore",
    type="button",
    :disabled="loadingMore",
    @click="doLoadMore",
  )
    span.loading.loading-xs.loading-spinner(v-if="loadingMore")
    | Load More

  .w-full.h-32.flex.items-center.justify-center(v-if="!commentsList?.length && pending")
    span.loading.loading-spinner
  .w-full.h-32.flex.items-center.justify-center(v-else-if="!commentsList?.length")
    .text-lg.text-center.text-neutral-content No Data to display
</template>

<script lang="ts">
export default {
  name: 'AdminCommentsPage',
}
</script>
