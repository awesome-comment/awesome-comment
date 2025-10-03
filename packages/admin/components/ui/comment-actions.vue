<script setup lang="ts">
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';

type RowItem = Comment & {
  isApproving: boolean;
  isRejecting: boolean;
  isDeleting: boolean;
  isDeleted: boolean;
  isReplying: boolean;
  from: string;
  toContent?: string;
}
type Props = {
  comment: RowItem;
  isBatching: boolean;
  loadingMore: boolean;
}
defineProps<Props>();
type Emits = {
  (event: 'delete', comment: Comment): void;
  (event: 'edit', content: string): void;
  (event: 'modal', isOpen: boolean): void;
  (event: 'reply', comment: Comment, parent: Comment): void;
  (event: 'review', comment: Comment, status: CommentStatus): void;
}
const emit = defineEmits<Emits>();
</script>

<template>
  <div class="grid gap-2">
    <button
      v-if="comment.status === CommentStatus.Pending || comment.status === CommentStatus.Rejected"
      class="btn btn-success btn-sm text-white sm:btn-xs hover:text-white"
      type="button"
      :disabled="isBatching || comment.isApproving || comment.isRejecting || comment.isDeleting || loadingMore"
      @click="emit('review', comment, CommentStatus.Approved)"
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
      @reply="emit('reply', $event, comment)"
      @open="emit('modal', true)"
      @close="emit('modal', false)"
    />
    <ui-delete-button
      :disabled="isBatching || comment.isApproving || comment.isRejecting || comment.isDeleting || loadingMore"
      :is-loading="comment.isDeleting"
      @delete="emit('delete', comment)"
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
      <div class="p-2 shadow-sm dropdown-content z-1 bg-base-100 rounded-box w-36 flex flex-col gap-1 border border-base-content/25">
        <edit-comment
          button-class="btn btn-sm sm:btn-xs btn-outline btn-warning"
          :comment="comment"
          @save="emit('edit', $event)"
          @open="emit('modal', true)"
          @close="emit('modal', false)"
        />
        <button
          v-if="comment.status === CommentStatus.Pending || comment.status === CommentStatus.Approved"
          class="btn btn-outline btn-warning btn-sm sm:btn-xs"
          type="button"
          :disabled="isBatching || comment.isApproving || comment.isRejecting || comment.isDeleting || loadingMore"
          @click="emit('review', comment, CommentStatus.Rejected)"
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
</template>
