<script setup lang="ts">
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { useAuth0 } from '@auth0/auth0-vue';

type Props = {
  comment: Comment;
}
const props = defineProps<Props>();
type Emits = {
  (event: 'reply', reply: Comment): void;
}
const emit = defineEmits<Emits>();
const auth0 = useAuth0();

const isReplying = ref<string>('');
const message = ref<string>('');

async function onReply(content: string): Promise<void> {
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
        postId: props.comment.postId,
        ancestorId: props.comment.ancestorId || props.comment.id,
        parentId: props.comment.id,
        status: props.comment.status,
      },
    });
    emit('reply', {
      id: data.id,
      content: content,
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
  <emoji-shortcuts
    :comment="comment"
    :is-replying="isReplying"
    @reply="onReply"
  />
</template>
