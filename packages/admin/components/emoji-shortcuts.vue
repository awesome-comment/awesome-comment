<script setup lang="ts">
import type { Comment, ResponseBody } from '@awesome-comment/core/types';
import { clickWithModifier } from '@awesome-comment/core/utils';
import { useAuth0 } from '@auth0/auth0-vue';
import { ShortcutEmojis } from '~/data';
import useConfigStore from '~/store';
import usePromptStore from '~/store/prompt';
import { replaceTemplate } from '~/utils';

type Props = {
  comment?: Comment;
}
const props = defineProps<Props>();
const isReplying = defineModel<string>('isReplying', '');
type Emits = {
  (event: 'reply', content: string): void;
}
const emit = defineEmits<Emits>();

const auth0 = useAuth0();
const configStore = useConfigStore();
const promptStore = usePromptStore();

const isPreviewPrompt = ref<boolean>(false);
const promptResult = ref<string>('');
const shortcuts = computed<{key: string, id: string}[]>(() => {
  return Object.entries(configStore.myConfig.aiTemplateShortcuts)
    .reduce((acc, [key, id]) => {
      if (!(id in promptStore.prompts)) return acc;

      acc.push({ key, id });
      return acc;
    }, [] as { key: string, id: string }[]);
});

async function doReplyEmoji(emoji: string, isAi = false): Promise<void> {
  if (isReplying.value && !isAi) return;

  if (!isAi) {
    isReplying.value = emoji;
  }

  emit('reply', emoji);
}
async function doReplyWithAi(id: string, event: MouseEvent): Promise<void> {
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
      :disabled="isReplying !== ''"
      @click="doReplyWithAi(item.id, $event)"
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
