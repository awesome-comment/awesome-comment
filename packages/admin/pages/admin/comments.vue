<script setup lang="ts">
import { parse } from 'marked';
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus, Languages } from '@awesome-comment/core/data';
import { useAuth0 } from '@auth0/auth0-vue';
import dayjs from 'dayjs';
import keyBy from 'lodash-es/keyBy';
import { ReplyComment } from '#components';

type RowItem = Comment & {
  isApproving: boolean;
  isRejecting: boolean;
  isDeleting: boolean;
  isReplying: boolean;
  from: string;
}

const postIdPrefix = __POST_ID_PREFIX__;
const CSKeys = Object.values(CommentStatus).filter((v) => !isNaN(Number(v)));
const auth0 = process.client ? useAuth0() : undefined;
const route = useRoute();
const replyComments = shallowRef<ReplyComment[]>();
const tr = ref<HTMLTableRowElement[]>([]);

const start = ref<number>(0);
const isBatching = ref<boolean>(false);
const hasMore = ref<boolean>(false);
const loadingMore = ref<boolean>(false);
const message = ref<string>('');
const filterStatus = ref<CommentStatus | 'all'>(
  route.query.status
    ? route.query.status === 'all' ? 'all' : Number(route.query.status)
    : CommentStatus.Pending
);
const filterPostId = ref<string>(route.query.post_id || '');
const filterUser = ref<string>(route.query.user || '');
const filterLanguage = ref<string>(route.query.language || '');
const comments = ref<Record<number, RowItem>>({});
const currentItem = ref<number>(-1);
const hasReplyModal = ref<boolean>(false);
const selected = ref<number[]>([]);
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

const { data: commentsList, status, refresh, error } = useLazyAsyncData(
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
        language: filterLanguage.value,
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
    hasMore.value = Object.values(cms).length >= 20;
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
    watch: [filterStatus, filterPostId, filterUser, filterLanguage, start],
  }
);

async function doReview(comment: RowItem, status: CommentStatus) {
  if (!auth0) return;

  if (comment.isApproving || comment.isRejecting || comment.isDeleting) return;

  if (status === CommentStatus.Approved) {
    comment.isApproving = true;
  } else {
    comment.isRejecting = true;
  }
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
  comment.isApproving = comment.isRejecting = false;
}
async function doDelete(comment: RowItem): Promise<void> {
  if (!auth0) return;
  if (comment.isApproving || comment.isRejecting || comment.isDeleting) return;
  if (!confirm('Are you sure to delete this comment?')) { return }

  comment.isDeleting = true;
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
  comment.isDeleting = false;
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
async function doRemoveReply(child: RowItem, comment: RowItem, index: number): Promise<void> {
  if (!auth0) return;
  if (!confirm('Are you sure to delete this reply?')) return;

  child.isDeleting = true;
  const token = await auth0.getAccessTokenSilently();
  await $fetch('/api/admin/comment/' + child.id, {
    method: 'DELETE',
    body: {
      isReply: true,
      postId: comment.postId,
      status: comment.status,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  comment.children.splice(index, 1);
}
function onKeydown(event: KeyboardEvent): void {
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
  if (hasReplyModal.value) return;

  let shouldScroll = false;
  switch (event.key) {
    case 'j':
    case 'J':
      shouldScroll = true;
      currentItem.value++;
      if (currentItem.value >= commentsList.value.length) {
        currentItem.value = 0;
      }
      break;

    case 'k':
    case 'K':
      shouldScroll = true;
      currentItem.value--;
      if (currentItem.value < 0) {
        currentItem.value = commentsList.value.length - 1;
      }
      break;

    case 'r':
    case 'R':
      if (currentItem.value === -1) return;

      (replyComments.value?.[ currentItem.value ] as ReplyComment).doOpenModal();
      event.preventDefault();
      break;
  }
  if (shouldScroll) {
    tr.value[ currentItem.value ].scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
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
      language: filterLanguage.value,
    },
  });
}

function formatTime(time: string): string {
  return dayjs.utc(time).local().format('YYYY-MM-DD HH:mm:ss');
}
function getUrl(postId: string, only = false): string {
  if (only) {
    const params = new URLSearchParams();
    params.set('post_id', postId);
    params.set('status', 'all');
    return `${location.pathname}?${params.toString()}`;
  }

  const url = new URL(location.href);
  url.searchParams.set('post_id', postId);
  return url.toString();
}
function notEnglish(postId: string): boolean {
  return !/\/en\/$/i.test(postId);
}
function parseMarkdown(md: string): string {
  return parse(md) as string;
}

onMounted(() => {
  comments.value = keyBy(commentsList.value, 'id');
  document.body.addEventListener('keydown', onKeydown);
});
onBeforeUnmount(() => {
  comments.value = {};
  commentsList.value && (commentsList.value.length = 0);
  document.body.removeEventListener('keydown', onKeydown);
});

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  name: 'admin-comments',
});
</script>

<template lang="pug">
header.flex.flex-col.mb-4.gap-4(class="sm:flex-row sm:items-center")
  h1.text-2xl.font-bold(class="sm:me-auto") Comments Management
  span.loading.loading-spinner(
    v-if="status === 'pending' && filterStatus < CommentStatus.UnReplied"
  )
  button.btn.btn-sm.me-2(
    v-if="filterStatus >= CommentStatus.UnReplied"
    type="button"
    :disabled="status === 'pending'"
    @click="doReset"
  )
    span.loading.loading-spinner(v-if="status === 'pending'")
    i.bi.bi-arrow-clockwise(v-else)
    | Refresh
  .form-control.flex-row.gap-2.me-2
    label.label(for="language")
      span.text-xs Language
    select.select.select-bordered.select-sm(
      id="language"
      v-model="filterLanguage"
      @change="onStatusChange"
    )
      option(value="") All
      option(
        v-for="lang in Languages",
        :value="lang",
        :key="lang"
      ) {{ lang }}
  .form-control.flex-row.gap-2
    label.label(for="status")
      span.text-xs Status
    select.select.select-bordered.select-sm(
      id="status"
      v-model="filterStatus"
      @change="onStatusChange"
    )
      option(value="all") All
      option(v-for="key in CSKeys", :value="key", :key="key") {{ CommentStatus[key] }}

.alert.alert-error.mb-4(v-if="message || error")
  i.bi.bi-exclamation-triangle-fill.me-2
  span {{ message || error.message }}
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

ui-batch-actions(
  v-model="selected"
  v-model:isWorking="isBatching"
  :comments="commentsList"
)

.overflow-x-auto
  table.table.table-pin-rows.table-pin-cols.table-sm(
    class="sm:table-md"
  )
    thead
      tr
        th ID
        th(class="sm:min-w-60") Content
        th User
        th Time
        th Post
        th Status
        th
    tbody(v-if="commentsList?.length")
      tr(
        v-for="(comment, index) in commentsList"
        ref="tr"
        :key="comment.id"
        :class="{'ring-4 ring-inset': index === currentItem, 'bg-base-200': notEnglish(comment.postId), 'bg-sky-100': selected.includes(comment.id)}"
      )
        td.align-top
          label.block.h-full.w-full.cursor-pointer
            input.hidden(
              type="checkbox"
              v-model="selected"
              name="selected"
              :value="comment.id"
            )
            | {{ comment.id }}
        td.align-top
          blockquote.ps-3.border-s-4.mb-2(
            v-if="comment.toContent"
            class="bg-base-300/50 border-base-content"
          )
            p.py-1.mb-2 {{comment.toContent}}
            p.text-xs(
              v-if="comment.toUser"
              class="text-base-content/50"
            ) - {{comment.toUser.name || comment.toUser.email}}
          p.break-words.max-w-sm.overflow-hidden {{ comment.content }}
          template(
            v-if="comment.children?.length"
          )
            .mt-4.chat.chat-end(
              v-for="(child, childIndex) in comment.children"
              :key="child.id"
            )
              .chat-header.mb-1.flex.gap-2
                button.btn.btn-circle.btn-ghost.btn-sm(
                  type="button"
                  :disabled="child.isDeleting"
                  @click="doRemoveReply(child, comment, childIndex)"
                )
                  span.loading.loading-spinner(v-if="child.isDeleting")
                  i.bi.bi-trash3.text-error(v-else)
                reply-comment(
                  button-class="btn-sm"
                  :comment="comment"
                  :reply="child.content"
                  :target="child"
                  @save="child.content = $event"
                  @open="hasReplyModal = true"
                  @close="hasReplyModal = false"
                )
                  template(#button-label) Edit
              .chat-bubble(v-html="parseMarkdown(child.content)")
              .chat-footer.mt-1
                i.bi.bi-patch-check-fill.me-1
                | {{child.user.email}}
          emoji-shortcuts.pt-4(
            v-if="comment.status === CommentStatus.Pending || filterStatus === CommentStatus.UnReplied"
            :comment="comment"
            @reply="onReply($event, comment)"
          )
        td.align-top
          user-cell(
            :filter="filter"
            :user="comment.user"
            :user-id="comment.user_id"
            :from="comment.from"
          )
        td.align-top
          time.text-xs(:datetime="comment.created_at") {{ formatTime(comment.created_at) }}
        td.align-top {{ comment.postId.replace(postIdPrefix, '') }}
          .flex.gap-2.mt-2
            context-menu-dropdown
              button.btn.btn-xs.btn-ghost(
                type="button"
                @click="doFilter(comment.postId)"
              )
                i.bi.bi-funnel-fill

              template(#menu)
                li
                  nuxt-link(
                    :to="getUrl(comment.postId, true)"
                    target="_blank"
                  ) Filter by post
            nuxt-link.btn.btn-xs.btn-ghost(
              target="_blank"
              external
              :to="comment.post_id"
            )
              i.bi.bi-box-arrow-up-right
        td.align-top {{ CommentStatus[comment.status] }}
        td.align-top
          .grid.grid-cols-2.gap-2.w-40(class="sm:flex sm:w-auto")
            button.btn.btn-success.btn-sm.text-white(
              v-if="comment.status === CommentStatus.Pending || comment.status === CommentStatus.Rejected"
              type="button"
              class="sm:btn-xs hover:text-white"
              :disabled="isBatching || comment.isApproving || comment.isRejecting || comment.isDeleting || loadingMore",
              @click="doReview(comment, CommentStatus.Approved)"
            )
              span.loading.loading-xs.loading-spinner(v-if="comment.isApproving")
              template(v-else) Approve
            reply-comment(
              ref="replyComments"
              :comment="comment"
              @reply="onReply($event, comment)"
              @open="hasReplyModal = true"
              @close="hasReplyModal = false"
            )
            details.dropdown.dropdown-end
              summary.btn.btn-outline.btn-sm.btn-square(
                class="sm:btn-xs"
                role="button"
                aria-label="More actions"
              )
                i.bi.bi-three-dots-vertical
                span.sr-only More actions
              .p-2.shadow.dropdown-content.z-1.bg-base-100.rounded-box.w-36.flex.flex-col.gap-1.border(
                class="border-base-content/25"
              )
                edit-comment(
                  button-class="btn btn-sm sm:btn-xs btn-outline btn-warning"
                  :comment="comment"
                  @save="comment.content = $event"
                  @open="hasReplyModal = true"
                  @close="hasReplyModal = false"
                )
                button.btn.btn-outline.btn-warning.btn-sm(
                  v-if="comment.status === CommentStatus.Pending || comment.status === CommentStatus.Approved"
                  type="button",
                  class="sm:btn-xs"
                  :disabled="isBatching || comment.isApproving || comment.isRejecting || comment.isDeleting || loadingMore",
                  @click="doReview(comment, CommentStatus.Rejected)"
                )
                  span.loading.loading-xs.loading-spinner(v-if="comment.isRejecting")
                  template(v-else) Reject
                button.btn.btn-outline.btn-error.btn-sm(
                  type="button",
                  class="sm:btn-xs"
                  :disabled="isBatching || comment.isApproving || comment.isRejecting || comment.isDeleting || loadingMore",
                  @click="doDelete(comment)"
                )
                  span.loading.loading-xs.loading-spinner(v-if="comment.isDeleting")
                  template(v-else) Delete
  button.mt-2.btn.btn-neutral.btn-sm.btn-block(
    v-if="hasMore",
    type="button",
    :disabled="loadingMore",
    @click="doLoadMore",
  )
    span.loading.loading-xs.loading-spinner(v-if="loadingMore")
    | Load More

  .w-full.h-32.flex.items-center.justify-center(v-if="!commentsList?.length && status === 'pending'")
    span.loading.loading-spinner
  .w-full.h-32.flex.items-center.justify-center(v-else-if="!commentsList?.length")
    .text-lg.text-center.text-neutral-content No Data to display
</template>

<script lang="ts">
export default {
  name: 'AdminCommentsPage',
}
</script>

<style>
.chat-bubble a {
  @apply text-info underline hover:no-underline;
}
</style>
