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
  isDeleted: boolean;
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
      const parent = cms[ reply.parentId ];
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

  message.value = '';
  comment.isDeleting = true;
  const token = await auth0.getAccessTokenSilently();
  try {
    await $fetch('/api/admin/comment/' + comment.id, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-AC-STATUS': comment.status.toString(),
        'X-AC-POST-id': comment.postId,
      },
    });
  } catch (e) {
    // temporary ignore 500 error
    if (e.status !== 500) {
      message.value = 'Failed to delete comment.' + e.message;
      comment.isDeleting = false;
      return;
    }
  }

  comment.isDeleted = true;
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
    headers: {
      Authorization: `Bearer ${token}`,
      'X-AC-STATUS': comment.status.toString(),
      'X-AC-POST-id': comment.postId,
    },
  });
  comment.children.splice(index, 1);
}
function doSelectAll(): void {
  if (selected.value.length === commentsList.value.length) {
    selected.value = [];
  } else {
    selected.value = commentsList.value.map((c) => c.id);
  }
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

<template>
  <header class="flex flex-col mb-4 gap-4 sm:flex-row sm:items-center">
    <h1 class="text-2xl font-bold sm:me-auto">
      Comments Management
    </h1>
    <span
      v-if="status === 'pending' && filterStatus < CommentStatus.UnReplied"
      class="loading loading-spinner"
    />
    <button
      v-if="filterStatus &gt;= CommentStatus.UnReplied"
      class="btn btn-sm me-2"
      type="button"
      :disabled="status === 'pending'"
      @click="doReset"
    >
      <span
        v-if="status === 'pending'"
        class="loading loading-spinner"
      />
      <i
        v-else
        class="bi bi-arrow-clockwise"
      />
      Refresh
    </button>
    <div class="form-control flex-row gap-2 me-2">
      <label
        class="label"
        for="language"
      >
        <span class="text-xs">Language</span>
      </label>
      <select
        id="language"
        v-model="filterLanguage"
        class="select select-bordered select-sm"
        @change="onStatusChange"
      >
        <option value="">
          All
        </option>
        <option
          v-for="lang in Languages"
          :key="lang"
          :value="lang"
        >
          {{ lang }}
        </option>
      </select>
    </div>
    <div class="form-control flex-row gap-2">
      <label
        class="label"
        for="status"
      >
        <span class="text-xs">Status</span>
      </label>
      <select
        id="status"
        v-model="filterStatus"
        class="select select-bordered select-sm"
        @change="onStatusChange"
      >
        <option value="all">
          All
        </option>
        <option
          v-for="key in CSKeys"
          :key="key"
          :value="key"
        >
          {{ CommentStatus[key] }}
        </option>
      </select>
    </div>
  </header>
  <div
    v-if="message || error"
    class="alert alert-error mb-4"
  >
    <i class="bi bi-exclamation-triangle-fill me-2" />
    <span>{{ message || error.message }}</span>
  </div>
  <div
    v-if="filterPostId || filterUser"
    class="flex gap-4 mb-4"
  >
    <button
      v-if="filterPostId"
      class="btn btn-outline btn-sm normal-case"
      type="button"
      @click="doFilter('')"
    >
      <i class="bi bi-funnel-fill" />
      {{ filterPostId }}
      <i class="bi bi-x-lg" />
    </button>
    <button
      v-if="filterUser"
      class="btn btn-outline btn-sm normal-case"
      type="button"
      @click="doFilterByUser('')"
    >
      <i class="bi bi-funnel-fill" />
      {{ filterUser }}
      <i class="bi bi-x-lg" />
    </button>
  </div>
  <ui-batch-actions
    v-model="selected"
    v-model:is-working="isBatching"
    v-model:comments="commentsList"
  />
  <div class="overflow-x-auto">
    <table class="table table-pin-rows table-pin-cols table-sm sm:table-md">
      <thead>
        <tr>
          <th
            class="hover:bg-base-200 cursor-pointer"
            title="Select all"
            @click="doSelectAll"
          >
            ID
          </th>
          <th class="sm:min-w-60">
            Content
          </th>
          <th>User</th>
          <th>Time</th>
          <th>Post</th>
          <th>Status</th>
          <th />
        </tr>
      </thead>
      <tbody v-if="commentsList?.length">
        <tr
          v-for="(comment, index) in commentsList"
          ref="tr"
          :key="comment.id"
          :class="{'ring-4 ring-inset': index === currentItem, 'bg-base-200': notEnglish(comment.postId), 'bg-sky-100 dark:bg-sky-900': selected.includes(comment.id), 'opacity-10 pointer-events-none': comment.isDeleted}"
        >
          <td
            class="!p-0"
            height="1"
          >
            <label class="block w-full h-full cursor-pointer py-3 px-4 hover:bg-base-200/50">
              <input
                v-model="selected"
                class="hidden"
                type="checkbox"
                name="selected"
                :value="comment.id"
              >
              {{ comment.id }}
            </label>
          </td>
          <td class="align-top">
            <blockquote
              v-if="comment.toContent"
              class="ps-3 border-s-4 mb-2 bg-base-300/50 border-base-content"
            >
              <p class="py-1 mb-2">
                {{ comment.toContent }}
              </p>
              <p
                v-if="comment.toUser"
                class="text-xs text-base-content/50"
              >
                - {{ comment.toUser.name || comment.toUser.email }}
              </p>
            </blockquote>
            <p class="break-words max-w-sm overflow-hidden">
              {{ comment.content }}
            </p>
            <template v-if="comment.children?.length">
              <div
                v-for="(child, childIndex) in comment.children"
                :key="child.id"
                class="mt-4 chat chat-end"
              >
                <div class="chat-header mb-1 flex gap-2">
                  <button
                    class="btn btn-circle btn-ghost btn-sm"
                    type="button"
                    :disabled="child.isDeleting"
                    @click="doRemoveReply(child, comment, childIndex)"
                  >
                    <span
                      v-if="child.isDeleting"
                      class="loading loading-spinner"
                    />
                    <i
                      v-else
                      class="bi bi-trash3 text-error"
                    />
                  </button>
                  <reply-comment
                    button-class="btn-sm"
                    :comment="comment"
                    :reply="child.content"
                    :target="child"
                    @save="child.content = $event"
                    @open="hasReplyModal = true"
                    @close="hasReplyModal = false"
                  >
                    <template #button-label>
                      Edit
                    </template>
                  </reply-comment>
                </div>
                <div
                  class="chat-bubble"
                  v-html="parseMarkdown(child.content)"
                />
                <div class="chat-footer mt-1">
                  <i class="bi bi-patch-check-fill me-1" />{{ child.user.email }}
                </div>
              </div>
            </template>
            <emoji-shortcuts-operator
              v-if="comment.status === CommentStatus.Pending || filterStatus === CommentStatus.UnReplied"
              class-name="pt-4"
              :comment="comment"
              @reply="onReply($event, comment)"
            />
          </td>
          <td class="align-top">
            <user-cell
              :filter="filter"
              :user="comment.user"
              :user-id="comment.user_id"
              :from="comment.from"
            />
          </td>
          <td class="align-top">
            <time
              class="text-xs"
              :datetime="comment.created_at"
            >{{ formatTime(comment.created_at) }}</time>
          </td>
          <td class="align-top">
            {{ comment.postId.replace(postIdPrefix, '') }}
            <div class="flex gap-2 mt-2">
              <context-menu-dropdown>
                <button
                  class="btn btn-xs btn-ghost"
                  type="button"
                  @click="doFilter(comment.postId)"
                >
                  <i class="bi bi-funnel-fill" />
                </button>
                <template #menu>
                  <li>
                    <nuxt-link
                      :to="getUrl(comment.postId, true)"
                      target="_blank"
                    >
                      Filter by post
                    </nuxt-link>
                  </li>
                </template>
              </context-menu-dropdown>
              <nuxt-link
                class="btn btn-xs btn-ghost"
                target="_blank"
                external="external"
                :to="comment.post_id"
              >
                <i class="bi bi-box-arrow-up-right" />
              </nuxt-link>
            </div>
          </td>
          <td class="align-top">
            {{ CommentStatus[comment.status] }}
          </td>
          <td class="align-top">
            <div class="grid grid-cols-2 gap-2 w-40">
              <button
                v-if="comment.status === CommentStatus.Pending || comment.status === CommentStatus.Rejected"
                class="btn btn-success btn-sm text-white sm:btn-xs hover:text-white"
                type="button"
                :disabled="isBatching || comment.isApproving || comment.isRejecting || comment.isDeleting || loadingMore"
                @click="doReview(comment, CommentStatus.Approved)"
              >
                <span
                  v-if="comment.isApproving"
                  class="loading loading-xs loading-spinner"
                />
                <template v-else>
                  Approve
                </template>
              </button>
              <reply-comment
                ref="replyComments"
                :comment="comment"
                @reply="onReply($event, comment)"
                @open="hasReplyModal = true"
                @close="hasReplyModal = false"
              />
              <ui-delete-button
                :disabled="isBatching || comment.isApproving || comment.isRejecting || comment.isDeleting || loadingMore"
                :is-loading="comment.isDeleting"
                @delete="doDelete(comment)"
              />
              <details class="dropdown dropdown-end">
                <summary
                  class="btn btn-outline btn-sm btn-square sm:btn-xs"
                  role="button"
                  aria-label="More actions"
                >
                  <i class="bi bi-three-dots-vertical" />
                  <span class="sr-only">More actions</span>
                </summary>
                <div class="p-2 shadow dropdown-content z-1 bg-base-100 rounded-box w-36 flex flex-col gap-1 border border-base-content/25">
                  <edit-comment
                    button-class="btn btn-sm sm:btn-xs btn-outline btn-warning"
                    :comment="comment"
                    @save="comment.content = $event"
                    @open="hasReplyModal = true"
                    @close="hasReplyModal = false"
                  />
                  <button
                    v-if="comment.status === CommentStatus.Pending || comment.status === CommentStatus.Approved"
                    class="btn btn-outline btn-warning btn-sm sm:btn-xs"
                    type="button"
                    :disabled="isBatching || comment.isApproving || comment.isRejecting || comment.isDeleting || loadingMore"
                    @click="doReview(comment, CommentStatus.Rejected)"
                  >
                    <span
                      v-if="comment.isRejecting"
                      class="loading loading-xs loading-spinner"
                    />
                    <template v-else>
                      Reject
                    </template>
                  </button>
                </div>
              </details>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <button
      v-if="hasMore"
      class="mt-2 btn btn-neutral btn-sm btn-block"
      type="button"
      :disabled="loadingMore"
      @click="doLoadMore"
    >
      <span
        v-if="loadingMore"
        class="loading loading-xs loading-spinner"
      />Load More
    </button>
    <div
      v-if="!commentsList?.length && status === 'pending'"
      class="w-full h-32 flex items-center justify-center"
    >
      <span class="loading loading-spinner" />
    </div>
    <div
      v-else-if="!commentsList?.length"
      class="w-full h-32 flex items-center justify-center"
    >
      <div class="text-lg text-center text-neutral-content">
        No Data to display
      </div>
    </div>
  </div>
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
