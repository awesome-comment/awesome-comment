<script setup lang="ts">
import type { Comment, ResponseBody } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { ShortcutEmojis } from '~/data';
import { useAuth0 } from '@auth0/auth0-vue';
import usePromptStore from '~/store/prompt';
import { replaceTemplate } from '~/utils';

type Props = {
  comment: Comment,
}
const props = defineProps<Props>();
type Emits = {
  (event: 'reply', reply: Comment): void;
}
const emit = defineEmits<Emits>();

const auth0 = useAuth0();
const promptStore = usePromptStore();

const isReplying = ref<string>('');
const message = ref<string>('');
const hasCommon = computed<boolean>(() => {
  return Object.values(promptStore.prompts).some(item => /^common$/i.test(item.title.trim()));
});

async function doReplyEmoji(emoji: string, isCommon = false): Promise<void> {
  if (isReplying.value && (isReplying.value !== 'common' || !isCommon)) return;

  if (!isCommon) {
    isReplying.value = emoji;
  }
  message.value = '';

  try {
    const accessToken = await auth0.getAccessTokenSilently();
    const { data } = await $fetch('/api/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        comment: emoji,
        postId: props.comment.postId,
        ancestorId: props.comment.ancestorId || props.comment.id,
        parentId: props.comment.id,
        status: props.comment.status,
      },
    });
    emit('reply', {
      id: data.id,
      content: emoji,
      postId: props.comment.postId,
      parentId: props.comment.id,
      ancestorId: props.comment.ancestorId || props.comment.id,
      status: CommentStatus.Approved,
      createdAt: new Date(),
      user: {
        email: auth0.user.value?.email,
        name: auth0.user.value?.name,
      },
    } as Comment);
  } catch (e) {
    message.value = (e as Error).message || String(e);
  }
  isReplying.value = '';
}
async function doReplyWithCommon(): Promise<void> {
  if (isReplying.value) return;

  const item = Object.values(promptStore.prompts)
    .find(item => /^common$/i.test(item.title.trim()));
  if (!item) return;

  isReplying.value = 'common';
  let title = '';
  if (item.template.includes('%TITLE%')) {
    const res = await $fetch<ResponseBody<{ title: string }>>('/api/fetch-url', {
      params: {
        url: props.comment.postId,
      },
    });
    title = res.data.title;
  }
  const replaced = replaceTemplate(item.template, props.comment, title, '');
  const accessToken = await auth0.getAccessTokenSilently();
  const res = await $fetch<ResponseBody<string>>('/api/admin/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      postId: props.comment.postId,
      messages: [{
        role: 'user',
        content: replaced,
      }],
    },
  });
  return doReplyEmoji(res.data, true);
}

onMounted(() => {
  promptStore.init();
});
</script>

<template>
  <div class="flex items-center gap-2 pt-4">
    <button
      v-for="item in ShortcutEmojis"
      :key="item"
      type="button"
      class="btn btn-sm btn-square btn-ghost"
      :disabled="!!isReplying"
      @click="doReplyEmoji(item)"
    >
      <span
        v-if="isReplying === item"
        class="loading loading-spinner"
      />
      <span v-else>{{ item }}</span>
    </button>
    <button
      v-if="hasCommon"
      type="button"
      class="btn btn-sm btn-circle btn-ghost"
      :disabled="!!isReplying"
      @click="doReplyWithCommon"
    >
      <span
        v-if="isReplying === 'common'"
        class="loading loading-spinner"
      />
      <span v-else>Go!</span>
    </button>
  </div>
</template>
