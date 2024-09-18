<script setup lang="ts">
import { CommentStatus } from '@awesome-comment/core/data';
import type { Comment } from '@awesome-comment/core/types';
import { useAuth0 } from '@auth0/auth0-vue';

const auth0 = useAuth0();
const comments = defineModel<Comment[]>('comments', []);
const modelValue = defineModel<number[]>('modelValue', []);
const isWorking = defineModel<boolean>('isWorking', false);

const isReplying = ref<boolean>(false);
const isApproving = ref<boolean>(false);
const isRejecting = ref<boolean>(false);
const isDeleting = ref<boolean>(false);

async function doReply(): Promise<void> {
  isReplying.value = true;
  isWorking.value = true;

  isReplying.value = false;
  isWorking.value = false;
}
async function doApprove(): Promise<void> {
  isReplying.value = true;
  isWorking.value = true;
  const newComments = [];
  const token = await auth0.getAccessTokenSilently();
  for (const comment of comments.value) {
    newComments.push(comment);
    if (!modelValue.value.includes(comment.id)
      || comment.status !== CommentStatus.Pending) continue;

    comment.status = CommentStatus.Approved;
    await $fetch('/api/admin/comment/' + comment.id, {
      method: 'PATCH',
      body: {
        postId: comment.postId,
        status: CommentStatus.Approved,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  comments.value = newComments;
  isReplying.value = false;
  isWorking.value = false;
}
async function doReject(): Promise<void> {
  isReplying.value = true;
  isWorking.value = true;

  const newComments = [];
  const token = await auth0.getAccessTokenSilently();
  for (const comment of comments.value) {
    newComments.push(comment);
    if (!modelValue.value.includes(comment.id)
      || comment.status !== CommentStatus.Pending) continue;

    comment.status = CommentStatus.Rejected;
    await $fetch('/api/admin/comment/' + comment.id, {
      method: 'PATCH',
      body: {
        postId: comment.postId,
        status: CommentStatus.Rejected,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  comments.value = newComments;
  isReplying.value = false;
  isWorking.value = false;
}
async function doDelete(): Promise<void> {
  isReplying.value = true;
  isWorking.value = true;

  const newComments = [];
  const token = await auth0.getAccessTokenSilently();
  for (const comment of comments.value) {
    if (!modelValue.value.includes(comment.id)) {
      newComments.push(comment);
      continue;
    }

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
  }
  comments.value = newComments;
  isReplying.value = false;
  isWorking.value = false;
}

</script>

<template>
  <div
    v-if="modelValue.length"
    class="flex items-center mb-4 gap-4border"
  >
    <div class="border-r px-4 self-stretch flex items-center">
      Selected {{ modelValue.length }} comments:
    </div>
    <emoji-shortcuts
      class="py-2"
      @reply="doReply"
    />
    <button
      class="btn btn-success btn-sm text-white sm:btn-xs hover:text-white"
      :disabled="isReplying || isApproving || isRejecting || isDeleting"
      type="button"
      @click="doApprove"
    >
      <span
        v-if="isApproving"
        class="loading loading-xs loading-spinner"
      />
      Approve
    </button>
    <button
      class="btn btn-warning btn-sm text-white sm:btn-xs hover:text-white"
      :disabled="isReplying || isApproving || isRejecting || isDeleting"
      type="button"
      @click="doReject"
    >
      <span
        v-if="isRejecting"
        class="loading loading-xs loading-spinner"
      />
      Reject
    </button>
    <button
      class="btn btn-error text-white btn-sm  sm:btn-xs hover:text-white"
      :disabled="isReplying || isApproving || isRejecting || isDeleting"
      type="button"
      @click="doDelete"
    >
      <span
        v-if="isDeleting"
        class="loading loading-xs loading-spinner"
      />
      Delete
    </button>
    <div class="border-l px-2 flex items-center ms-auto self-stretch">
      <button
        class="btn btn-ghost btn-sm btn-circle"
        type="button"
        @click="modelValue.length = 0"
      >
        <i class="bi bi-x-lg" />
        <span class="sr-only">Clear</span>
      </button>
    </div>
  </div>
</template>
