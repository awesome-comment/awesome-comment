<script setup lang="ts">
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { useAuth0 } from '@auth0/auth0-vue';
import ReplyComment from '~/components/reply-comment.vue';

type RowItem = Comment & {
  isReviewing: boolean;
  isReplying: boolean;
  from: string;
}

const postIdPrefix = __POST_ID_PREFIX__;
const CSKeys = Object.values(CommentStatus).filter((v) => !isNaN(Number(v)));
const auth0 = process.client ? useAuth0() : undefined;
const route = useRoute();
const replyComment = shallowRef <ReplyComment[]>();

const start = ref<number>(0);
const hasMore = ref<boolean>(false);
const loadingMore = ref<boolean>(false);
const message = ref<string>('');
const filterStatus = ref<CommentStatus | 'all'>(route.query.status || CommentStatus.UnReplied);
const filterPostId = ref<string>(route.query.post_id || '');
const filterUser = ref<string>(route.query.user || '');
const comments = ref<Record<number, RowItem>>({});
const currentItem = ref<number>(-1);
const hasReplyModal = ref<boolean>(false);
const filter = computed<URLSearchParams>(() => {
  const params = new URLSearchParams();
  if (filterStatus.value !== 'all') {
    params.set('status', filterStatus.value.toString());
  }
  if (filterPostId.value) {
    params.set('post_id', filterPostId.value);
  }
  if (filterUser.value) {
    params.set('user', filterUser.value);
  }
  return params;
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
        user: filterUser.value,
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
    watch: [filterStatus, filterPostId, filterUser, start],
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
  doReset();
  filterPostId.value = postId;
  updateUrl();
}
function doFilterByUser(userId: string): void {
  doReset();
  filterUser.value = userId;
  updateUrl();
}
function doReset(shouldRefresh?: MouseEvent | boolean): void {
  comments.value = {};
  currentItem.value = -1;
  start.value = 0;
  hasMore.value = false;
  if (shouldRefresh) refresh();
}
function onKeydown(event: KeyboardEvent): void {
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  if (hasReplyModal.value) return;

  switch (event.key) {
    case 'j':
    case 'J':
      currentItem.value++;
      if (currentItem.value >= commentsList.value.length) {
        currentItem.value = 0;
      }
      break;

    case 'k':
    case 'K':
      currentItem.value--;
      if (currentItem.value < 0) {
        currentItem.value = commentsList.value.length - 1;
      }
      break;

    case 'r':
    case 'R':
      if (currentItem.value === -1) return;

      replyComment.value?.[ currentItem.value ].doOpenModal();
      event.preventDefault();
      break;
  }
}
function onStatusChange(): void {
  doReset();
  updateUrl();
}
function onReply(reply: Comment, parent: Comment): void {
  parent.children ??= [];
  parent.children.push(reply);
  // replied comment will be auto approved
  parent.status = CommentStatus.Approved;
}
function updateUrl(): void {
  const router = useRouter();
  router.push({
    query: {
      status: filterStatus.value,
      post_id: filterPostId.value,
      user: filterUser.value,
    },
  });
}

onMounted(() => {
  document.body.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
  document.body.removeEventListener('keydown', onKeydown);
});

definePageMeta({
  middleware: ['auth'],
});
</script>

<template lang="pug">
header.flex.flex-col.mb-4.gap-4(class="sm:flex-row sm:items-center")
  h1.text-2xl.font-bold(class="sm:me-auto") Comments Management
  span.loading.loading-spinner(
    v-if="pending && filterStatus < CommentStatus.UnReplied"
  )
  button.btn.btn-sm.me-2(
    v-if="filterStatus >= CommentStatus.UnReplied"
    type="button"
    :disabled="pending"
    @click="doReset"
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
    i.bi.bi-exclamation-triangle-fill.me-2
    | {{ message }}

.flex.gap-4.mb-4(v-if="filterPostId || filterUser")
  button.btn.btn-outline.btn-sm.normal-case(
    v-if="filterPostId"
    type="button"
    @click="doFilter('')"
  )
    i.bi.bi-funnel-fill
    | {{filterPostId}}
    i.bi.bi-x-lg
  button.btn.btn-outline.btn-sm.normal-case(
    v-if="filterUser"
    type="button"
    @click="doFilterByUser('')"
  )
    i.bi.bi-funnel-fill
    | {{filterUser}}
    i.bi.bi-x-lg

.overflow-x-auto
  table.table.table-pin-rows.table-pin-cols
    thead
      tr
        th ID
        th.min-w-60 Content
        th User
        th Time
        th Post
        th Status
        th
    tbody(v-if="commentsList?.length")
      tr(
        v-for="(comment, index) in commentsList"
        :key="comment.id"
        :class="{'ring-4 ring-inset': index === currentItem}"
      )
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
                @open="hasReplyModal = true"
                @close="hasReplyModal = false"
              )
            .chat-bubble {{comment.children[0].content}}
            .chat-footer.mt-1
              i.bi.bi-patch-check-fill.me-1
              | {{comment.children[0].user.email}}
        td
          user-cell(
            :filter="filter"
            :user="comment.user"
            :user-id="comment.user_id"
            :from="comment.from"
            @select-user="doFilterByUser"
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
              ref="replyComment"
              :comment="comment"
              @reply="onReply($event, comment)"
              @open="hasReplyModal = true"
              @close="hasReplyModal = false"
            )
            edit-comment(
              :comment="comment"
              @save="comment.content = $event"
              @open="hasReplyModal = true"
              @close="hasReplyModal = false"
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
