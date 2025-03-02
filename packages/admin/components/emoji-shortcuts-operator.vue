<script setup lang="ts">
import type { Comment, ResponseBody } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { useAuth0 } from '@auth0/auth0-vue';
import { replaceTemplate } from '~/utils';
import usePromptStore from '~/store/prompt';
import useConfigStore from '~/store';

type Props = {
  className: string;
  comment: Comment;
}
const props = defineProps<Props>();
type Emits = {
  (event: 'reply', reply: Comment): void;
}
const emit = defineEmits<Emits>();

const auth0 = useAuth0();
const configStore = useConfigStore();
const promptStore = usePromptStore();

const isReplying = ref<string>('');
const message = ref<string>('');
const isPreviewPrompt = ref<boolean>(false);
const promptResult = ref<string>('');

async function doSubmitChat(): Promise<void> {
  const aiReply = await getAiReply(props.comment.postId, promptResult.value);
  return replyToComment(aiReply);
}
async function onReply(content: string, isPreview: boolean): Promise<void> {
  if (isReplying.value) return;

  isReplying.value = content;
  if (configStore.config.shortcutEmojis.includes(content)) {
    return replyToComment(content);
  }

  // generate reply with AI
  const replyPrompt = await getPrompt(content);
  if (isPreview) {
    promptResult.value = replyPrompt;
    isPreviewPrompt.value = true;
    return;
  }

  const aiReply = await getAiReply(props.comment.postId, replyPrompt);
  return replyToComment(aiReply);
}
async function replyToComment(content: string): Promise<void> {
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
async function getPrompt(id: string): Promise<string> {
  const template = promptStore.prompts[ id ].content;
  let title = '';
  if (template.includes('$TITLE$')) {
    const res = await $fetch<ResponseBody<{ title: string }>>('/api/fetch-url', {
      params: {
        url: props.comment.postId,
      },
    });
    title = res.data.title;
  }
  return replaceTemplate(template, props.comment, title, '');
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

function onModalClose(isSubmit: boolean): void {
  isPreviewPrompt.value = false;
  if (!isSubmit) {
    isReplying.value = '';
  }
}
</script>

<template>
  <emoji-shortcuts
    v-model:is-replying="isReplying"
    :class="className"
    :comment="comment"
    @reply="onReply"
  />

  <ui-preview-prompt-modal
    v-if="isPreviewPrompt"
    :prompt="promptResult"
    @close="onModalClose"
    @submit="doSubmitChat"
  />
</template>
