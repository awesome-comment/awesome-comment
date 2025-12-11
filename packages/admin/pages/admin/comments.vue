<script setup lang="ts">
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { useAuth0 } from '@auth0/auth0-vue';
import keyBy from 'lodash-es/keyBy';
import type { RowItem } from '~/components/comments/comment-row.vue';

const postIdPrefix = __POST_ID_PREFIX__;
const CSKeys = Object.values(CommentStatus).filter((v) => !isNaN(Number(v)));
const auth0 = import.meta.client ? useAuth0() : undefined;
const route = useRoute();

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
const filterPostId = ref<string>(route.query.post_id as string || '');
const filterUser = ref<string>(route.query.user as string || '');
const filterLanguage = ref<string>(route.query.language as string || '');
const filterTag = ref<string>(route.query.tag as string || '');
const comments = ref<Record<number, RowItem>>({});
const currentItem = ref<number>(-1);
const hasReplyModal = ref<boolean>(false);
const selected = ref<number[]>([]);
const tr = ref<HTMLTableRowElement[]>([]);

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

const { data: commentsList, status, refresh, error } = useLazyAsyncData<RowItem[]>(
  'comments',
  async function () {
    if (!auth0) return [];
    if (!auth0.isAuthenticated.value) {
      message.value = 'Sorry, you must login first.'
      return [];
    }

    const token = await auth0.getAccessTokenSilently();
    const { data, meta } = await $fetch('/api/admin/comments', {
      query: {
        status: filterStatus.value === 'all' ? null : filterStatus.value,
        postId: filterPostId.value,
        start: start.value,
        user: filterUser.value,
        language: filterLanguage.value,
        tag: filterTag.value,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { adminEmails = [] } = meta?.config || {};
    const [cms, replies, replyTo]: [Record<number, RowItem>, Comment[], Record<string, Comment>] = (data || [])
      .reduce(([map, replies, replyTo], c) => {
        const from = c.user_id.split('|');
        c.user = JSON.parse((c.user || '{}') as string);
        c.userId = c.user_id;
        c.status = Number(c.status);
        c.id = Number(c.id);
        c.from = from.length > 1 ? from[ 0 ] : 'google';
        c.postId = c.post_id;
        c.parentId = Number(c.parent_id);
        c.ancestorId = Number(c.ancestor_id);
        if (c.tags && typeof c.tags === 'string') {
          try {
            c.tags = JSON.parse(c.tags);
          } catch {
            c.tags = [];
          }
        }
        if (adminEmails.includes(c.user.email) && c.parentId) {
          replies.push(c);
        } else if (c.status === status.value) {
          replyTo[ c.id ] = c;
        } else {
          map[ c.id ] = c;
        }
        return [map, replies, replyTo];
      }, [{}, [], {}]);
    hasMore.value = Object.values(cms).length >= 20;
    for (const reply of replies) {
      const parent = cms[ reply.parentId ];
      if (!parent) continue;
      parent.children = parent.children ?? [];
      parent.children.push(reply);
    }
    for (const item of Object.values(cms)) {
      if (item.parentId) {
        const parent = replyTo[ item.parentId ] || cms[ item.parentId ];
        if (parent) {
          item.toContent = parent.content;
          item.toUser = parent.user;
        }
      }
    }
    Object.assign(comments.value, cms);
    loadingMore.value = false;
    return Object.values(comments.value).reverse();
  },
  {
    default() {
      return Object.values(comments.value).reverse();
    },
    watch: [filterStatus, filterPostId, filterUser, filterLanguage, filterTag, start],
  },
);

function onApproved(id: number) {
  if (filterStatus.value === CommentStatus.Pending) {
    commentsList.value = commentsList.value.filter(item => item.id !== id);
  }
}
function onDeleted(comment: RowItem) {
  commentsList.value = commentsList.value.filter(item => item.id !== comment.id);
}

function doLoadMore() {
  loadingMore.value = true;
  start.value += 20;
}

function doReset(shouldRefresh?: MouseEvent | boolean): void {
  comments.value = {};
  currentItem.value = -1;
  start.value = 0;
  hasMore.value = false;
  if (shouldRefresh) refresh();
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

function doFilterByTag(tag: string): void {
  doReset();
  filterTag.value = tag;
  updateUrl();
}

function doSelectAll(): void {
  if (selected.value.length === commentsList.value.length) {
    selected.value = [];
  } else {
    selected.value = commentsList.value.map((c) => c.id);
  }
}

function toggleSelect(id: number): void {
  const index = selected.value.indexOf(id);
  if (index === -1) {
    selected.value.push(id);
  } else {
    selected.value.splice(index, 1);
  }
}

function onStatusChange(): void {
  doReset();
  updateUrl();
}

function updateUrl(): void {
  const router = useRouter();
  router.push({
    query: {
      status: filterStatus.value,
      post_id: filterPostId.value,
      user: filterUser.value,
      language: filterLanguage.value,
      tag: filterTag.value,
    },
  });
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
  }
  if (shouldScroll) {
    tr.value[ currentItem.value ]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
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
  <comments-header
    v-model:filter-status="filterStatus"
    v-model:filter-language="filterLanguage"
    v-model:filter-tag="filterTag"
    :status="status"
    :cs-keys="CSKeys"
    :comment-status-enum="CommentStatus"
    @refresh="refresh"
    @status-change="onStatusChange"
  />

  <div
    v-if="message || error"
    class="alert alert-error mb-4"
  >
    <i class="bi bi-exclamation-triangle-fill me-2" />
    <span>{{ message || error?.message || error }}</span>
  </div>

  <comments-active-filters
    :filter-post-id="filterPostId"
    :filter-user="filterUser"
    :filter-tag="filterTag"
    @clear-post-id="doFilter('')"
    @clear-user="doFilterByUser('')"
    @clear-tag="doFilterByTag('')"
  />

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
            class="hover:bg-base-200 cursor-pointer hidden sm:table-cell"
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
          <th class="hidden sm:table-cell">
            Tags
          </th>
          <th class="hidden sm:table-cell">
            Status
          </th>
          <th class="hidden sm:table-cell" />
        </tr>
      </thead>
      <tbody v-if="commentsList?.length">
        <comments-comment-row
          v-for="(comment, index) in commentsList"
          ref="tr"
          :key="comment.id"
          :comment="comment"
          :index="index"
          :current-item="currentItem"
          :selected="selected"
          :post-id-prefix="postIdPrefix"
          :is-batching="isBatching"
          :loading-more="loadingMore"
          :filter="filter"
          @approve="onApproved"
          @select="toggleSelect"
          @edit="comment.content = $event"
          @modal="hasReplyModal = $event"
          @deleted="onDeleted"
          @error="message = $event"
          @filter-by-post="doFilter"
          @filter-by-tag="doFilterByTag"
        />
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
