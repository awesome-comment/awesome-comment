<script setup lang="ts">
import { parse } from 'marked';
import type { Comment, CommentUser, User } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { useAuth0 } from '@auth0/auth0-vue';
import type { FetchError } from 'ofetch';

export type RowItem = Comment & {
  children?: RowItem[];
  created_at: string;
  from: string;
  id: number;
  isApproving: boolean;
  isRejecting: boolean;
  isDeleting: boolean;
  isDeleted: boolean;
  isReplying: boolean;
  toContent?: string;
  toUser?: CommentUser;
  user: User;
}

const props = defineProps<{
  comment: RowItem;
  index: number;
  currentItem: number;
  selected: number[];
  postIdPrefix: string;
  isBatching: boolean;
  loadingMore: boolean;
  filter: URLSearchParams;
}>();

const emit = defineEmits<{
  approve: [id: number];
  select: [id: number];
  edit: [content: string];
  reply: [reply: Comment, parent: Comment];
  modal: [isOpen: boolean];
  filterByPost: [postId: string];
  filterByTag: [tag: string];
  deleted: [comment: RowItem];
  error: [message: string];
}>();

const auth0 = import.meta.client ? useAuth0() : undefined;

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
    body: { postId: comment.postId, status },
    headers: { Authorization: `Bearer ${token}` },
  });
  comment.status = status;
  comment.isApproving = comment.isRejecting = false;
  if (status === CommentStatus.Approved) {
    emit('approve', comment.id);
  }
}

async function doDelete(): Promise<void> {
  if (!auth0) return;
  const comment = props.comment;
  if (comment.isApproving || comment.isRejecting || comment.isDeleting) return;

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
    if ((e as FetchError).status !== 500) {
      emit('error', 'Failed to delete comment.' + (e as FetchError).message);
      comment.isDeleting = false;
      return;
    }
  }
  comment.isDeleted = true;
  comment.isDeleting = false;
  emit('deleted', comment);
}

async function doRemoveReply(child: RowItem, index: number): Promise<void> {
  if (!auth0) return;
  if (!confirm('Are you sure to delete this reply?')) return;

  const comment = props.comment;
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
  comment.children?.splice(index, 1);
}

function onReply(reply: Comment) {
  const comment = props.comment;
  comment.children ??= [];
  comment.children.push(reply);
  comment.status = CommentStatus.Approved;
  emit('reply', reply, comment);
}

function formatTime(time: string): string {
  const dayjs = useDayjs();
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
</script>

<template>
  <tr
    :class="[
      {
        'ring-4 ring-inset': index === currentItem,
        'bg-sky-100 dark:bg-sky-900': selected.includes(comment.id),
        'opacity-10 pointer-events-none': comment.isDeleted,
      },
      notEnglish(comment.postId) ? 'bg-base-200': 'bg-[#efe] dark:bg-[#042]'
    ]"
  >
    <td
      class="p-0! hidden sm:table-cell"
      height="1"
    >
      <label class="block w-full h-full cursor-pointer py-3 px-4 hover:bg-base-200/50">
        <input
          :checked="selected.includes(comment.id)"
          class="hidden"
          type="checkbox"
          name="selected"
          :value="comment.id"
          @change="$emit('select', comment.id)"
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
      <p
        v-if="comment.translation"
        class="max-w-sm text-xs mt-1 text-base-content/90 break-words overflow-hidden"
      >
        (Translation: {{ comment.translation }})
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
              @click="doRemoveReply(child, childIndex as number)"
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
              @open="$emit('modal', true)"
              @close="$emit('modal', false)"
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
            <i class="bi bi-patch-check-fill me-1" />{{ child.user?.email }}
          </div>
        </div>
      </template>
      <emoji-shortcuts-operator
        v-if="!comment.children?.length"
        class-name="pt-4"
        :comment="comment"
        @reply="onReply"
      />
      <ui-comment-actions
        class="grid-cols-4 py-2 sm:hidden"
        :comment="comment"
        :is-batching="isBatching"
        :loading-more="loadingMore"
        @delete="doDelete"
        @edit="$emit('edit', $event)"
        @modal="$emit('modal', $event)"
        @reply="onReply"
        @review="doReview"
      />
    </td>
    <td class="align-top">
      <user-cell
        :filter="filter"
        :user="comment.user"
        :user-id="comment.userId"
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
            @click="$emit('filterByPost', comment.postId)"
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
          external
          :to="comment.postId"
        >
          <i class="bi bi-box-arrow-up-right" />
        </nuxt-link>
      </div>
    </td>
    <td class="align-top hidden sm:table-cell">
      <div
        v-if="comment.tags?.length"
        class="flex flex-wrap gap-1"
      >
        <button
          v-for="tag in comment.tags"
          :key="tag"
          type="button"
          class="badge badge-sm cursor-pointer hover:opacity-80"
          :class="{
            'badge-info': tag === 'Question',
            'badge-error': tag === 'Bug report',
            'badge-warning': tag === 'Criticism',
            'badge-success': tag === 'Suggestion',
            'badge-neutral': tag === 'Greeting',
          }"
          @click="$emit('filterByTag', tag)"
        >
          {{ tag }}
        </button>
      </div>
    </td>
    <td class="align-top hidden sm:table-cell">
      {{ CommentStatus[comment.status] }}
    </td>
    <td class="align-top hidden sm:table-cell">
      <ui-comment-actions
        class="grid-cols-2 w-40"
        :comment="comment"
        :is-batching="isBatching"
        :loading-more="loadingMore"
        @delete="doDelete"
        @edit="$emit('edit', $event)"
        @modal="$emit('modal', $event)"
        @reply="onReply"
        @review="doReview"
      />
    </td>
  </tr>
</template>
