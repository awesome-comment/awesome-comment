<script setup lang="ts">
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { ShortcutEmojis } from '~/data';
import { useAuth0 } from '@auth0/auth0-vue';

type Props = {
  comment: Comment,
}
const props = defineProps<Props>();
type Emits = {
  (event: 'reply', reply: Comment): void;
}
const emit = defineEmits<Emits>();

const auth0 = useAuth0();

const isReplying = ref<string>('');
const message = ref<string>('');

async function doReplyEmoji(emoji: string): Promise<void> {
  if (isReplying.value) return;

  isReplying.value = emoji;
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
  </div>
</template>
