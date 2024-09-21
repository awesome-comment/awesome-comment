<script setup lang="ts">
import { CommentStatus } from '@awesome-comment/core/data';
import type { Comment, ResponseBody } from '@awesome-comment/core/types';
import { useAuth0 } from '@auth0/auth0-vue';
import { ShortcutEmojis } from '~/data';
import { replaceTemplate } from '~/utils';
import usePromptStore from '~/store/prompt';

const auth0 = useAuth0();
const promptStore = usePromptStore();
const comments = defineModel<Comment[]>('comments', []);
const modelValue = defineModel<number[]>('modelValue', []);
const isWorking = defineModel<boolean>('isWorking', false);

const isReplying = ref<string>('');
const isApproving = ref<boolean>(false);
const isRejecting = ref<boolean>(false);
const isDeleting = ref<boolean>(false);

async function doReply(content: string): Promise<void> {
  if (isWorking.value) return;

  const newComments = [];
  for (const comment of comments.value) {
    newComments.push(comment);
    if (!modelValue.value.includes(comment.id)) continue;

    if (ShortcutEmojis.includes(content)) {
      await replyToComment(content, comment);
      continue;
    }

    const replyPrompt = await getPrompt(content, comment);
    const aiReply = await getAiReply(comment.postId, replyPrompt);
    await replyToComment(aiReply, comment);
  }
  isReplying.value = '';
}
async function doApprove(): Promise<void> {
  if (isWorking.value) return;

  isApproving.value = true;
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
  isApproving.value = false;
}
async function doReject(): Promise<void> {
  if (isWorking.value) return;

  isRejecting.value = true;
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
  isRejecting.value = false;
}
async function doDelete(): Promise<void> {
  if (isWorking.value) return;
  isDeleting.value = true;

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
  isDeleting.value = false;
}

async function replyToComment(content: string, comment: Comment): Promise<void> {
  try {
    const accessToken = await auth0.getAccessTokenSilently();
    const { data } = await $fetch('/api/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        comment: content,
        postId: comment.postId,
        ancestorId: comment.ancestorId || comment.id,
        parentId: comment.id,
        status: comment.status,
      },
    });
    comment.children.push({
      id: data.id,
      content: content,
      postId: comment.postId,
      parentId: comment.id,
      ancestorId: comment.ancestorId || comment.id,
      status: CommentStatus.Approved,
      createdAt: new Date(),
      user: {
        email: auth0.user.value?.email,
        name: auth0.user.value?.name,
      },
    } as Comment);
    comment.status = CommentStatus.Approved;
  } catch (e) {
    console.log((e as Error).message || String(e));
  }
  isReplying.value = '';
}
async function getPrompt(id: string, comment: Comment): Promise<string> {
  const template = promptStore.prompts[ id ].content;
  let title = '';
  if (template.includes('$TITLE$')) {
    const res = await $fetch<ResponseBody<{ title: string }>>('/api/fetch-url', {
      params: {
        url: comment.postId,
      },
    });
    title = res.data.title;
  }
  return replaceTemplate(template, comment, title, '');
}
async function getAiReply(postId:string, content: string): Promise<string> {
  const accessToken = await auth0.getAccessTokenSilently();
  const reqOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      postId,
      messages: [{
        role: 'user',
        content,
      }],
    },
  };
  const res = await $fetch<ResponseBody<string>>('/api/admin/chat', reqOptions);
  return res.data;
}

watch([isApproving, isRejecting, isDeleting, isReplying], () => {
  isWorking.value = isApproving.value || isRejecting.value || isDeleting.value || isReplying.value;
});
</script>

<template>
  <div
    v-if="modelValue.length"
    class="flex items-center gap-4 border rounded-full"
  >
    <div class="border-r px-4 self-stretch flex items-center">
      Selected <strong class="mx-2 text-primary">{{ modelValue.length }}</strong> comments:
    </div>
    <emoji-shortcuts
      v-model:is-replying="isReplying"
      class="py-2"
      @reply="doReply"
    />
    <button
      class="btn btn-success btn-sm text-white sm:btn-xs hover:text-white ms-8"
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
