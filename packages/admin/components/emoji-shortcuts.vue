<script setup lang="ts">
import type { Comment, ResponseBody } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { clickWithModifier } from '@awesome-comment/core/utils';
import { useAuth0 } from '@auth0/auth0-vue';
import { ShortcutEmojis } from '~/data';
import useConfigStore from '~/store';
import usePromptStore from '~/store/prompt';
import { replaceTemplate } from '~/utils';

type Props = {
  comment?: Comment,
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
const isPreviewPrompt = ref<boolean>(false);
const promptResult = ref<string>('');
const message = ref<string>('');
const shortcuts = computed<{key: string, id: string}[]>(() => {
  return Object.entries(configStore.myConfig.aiTemplateShortcuts)
    .reduce((acc, [key, id]) => {
      if (!(id in promptStore.prompts)) return acc;

      acc.push({ key, id });
      return acc;
    }, [] as { key: string, id: string }[]);
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
async function doReplyWithCommon(id: string, event: MouseEvent): Promise<void> {
  if (isReplying.value) return;

  const hasPreviewPrompt = clickWithModifier(event);

  isReplying.value = id;
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
  promptResult.value = replaceTemplate(template, props.comment, title, '');

  if (hasPreviewPrompt) {
    isPreviewPrompt.value = true;
    return;
  }

  return doSubmitChat();
}
async function doSubmitChat(): Promise<void> {
  const accessToken = await auth0.getAccessTokenSilently();
  const reqOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      postId: props.comment.postId,
      messages: [{
        role: 'user',
        content: promptResult.value,
      }],
    },
  };
  const res = await $fetch<ResponseBody<string>>('/api/admin/chat', reqOptions);
  return doReplyEmoji(res.data, true);
}

function onModalClose(isSubmit: boolean): void {
  isPreviewPrompt.value = false;
  if (!isSubmit) {
    isReplying.value = '';
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
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
      v-for="item in shortcuts"
      :key="item.key"
      type="button"
      class="btn btn-sm btn-circle btn-ghost"
      :disabled="isReplying === item.id"
      @click="doReplyWithCommon(item.id, $event)"
    >
      <span
        v-if="isReplying === item.id"
        class="loading loading-spinner"
      />
      <span v-else>{{ item.key }}</span>
    </button>

    <ui-preview-prompt-modal
      v-if="isPreviewPrompt"
      :prompt="promptResult"
      @close="onModalClose"
      @submit="doSubmitChat"
    />
  </div>
</template>
