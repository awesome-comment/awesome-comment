<script setup lang="ts">
import type { Comment, ResponseBody } from '@awesome-comment/core/types';
import { clickWithModifier } from '@awesome-comment/core/utils';
import usePromptStore from '~/store/prompt';
import type { AiPromptTemplate } from '~/types';
import { replaceTemplate, writeToClipboard } from '~/utils';
import { useAuth0 } from '@auth0/auth0-vue';
import useConfigStore from '~/store';

type Props = {
  comment: Comment;
  reply: string;
}
const props = defineProps<Props>();
type Emits = {
  (event: 'ai', text: string, autoSubmit: boolean): void;
  (event: 'ai:start');
}
const emit = defineEmits<Emits>();

const auth0 = useAuth0();
const configStore = useConfigStore();
const promptStore = usePromptStore();
const toast = useToast();

const templateId = ref<string>('');
const isPreviewPrompt = ref<boolean>(false);
const isLoading = ref<string>('');
const isCopied = ref<string>('');
const promptResult = ref<string>('');
const fixed = computed<Record<string, AiPromptTemplate>>(() => {
  return configStore.myConfig.fixedAiTemplates.reduce((acc, id) => {
    const template = promptStore.prompts[ id ];
    if (template) {
      acc[ id ] = template as AiPromptTemplate;
    }
    return acc;
  }, {} as Record<string, AiPromptTemplate>);
});
const length = computed<number>(() => Object.keys(fixed.value).length);

async function doUse(id: string, event?: MouseEvent): Promise<void> {
  templateId.value = id;
  const hasPreviewPrompt = clickWithModifier(event);

  const item = promptStore.prompts[ id ];
  if (!item) return;
  isLoading.value = id;
  if (configStore.myConfig.autoSubmit.includes(Number(id))) {
    emit('ai:start');
  }
  let title = '';
  if (item.content.includes('$TITLE$')) {
    const res = await $fetch<ResponseBody<{ title: string }>>('/api/fetch-url', {
      params: {
        url: props.comment.postId,
      },
    });
    title = res.data.title;
  }
  promptResult.value = replaceTemplate(item.content, props.comment, title, props.reply);

  if (hasPreviewPrompt) {
    isPreviewPrompt.value = true;
    return;
  }

  return doSubmitChat()
}
async function doSubmitChat(): Promise<void> {
  isLoading.value = templateId.value;
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
  try {
    const res = await $fetch<ResponseBody<string>>('/api/admin/chat', reqOptions);
    emit('ai', res.data, configStore.myConfig.autoSubmit.includes(Number(templateId.value)));
  } catch (e) {
    toast.add({
      title: 'Error',
      color: 'red',
      description: 'Failed to fetch AI response',
    });
  }
  isLoading.value = '';
}

function onModalClose(isSubmit: boolean): void {
  isPreviewPrompt.value = false;
  if (!isSubmit) {
    isLoading.value = '';
  }
}

onBeforeUnmount(() => {
  isCopied.value = '';
});
</script>

<template>
  <div
    v-if="length"
    class="flex flex-wrap gap-1 items-center"
  >
    <button
      v-for="(template, id) in fixed"
      :key="id"
      type="button"
      class="btn btn-xs btn-outline text-white"
      :class="isCopied === id ? 'btn-success' : 'btn-info'"
      :disabled="!!isLoading"
      @click="doUse(id, $event)"
    >
      <span
        v-if="isLoading === id"
        class="loading loading-spinner w-3 h-3"
      />
      <i
        v-if="isCopied === id"
        class="bi bi-check"
      />
      {{ template.title }}
    </button>

    <ui-preview-prompt-modal
      v-if="isPreviewPrompt"
      :prompt="promptResult"
      @close="onModalClose"
      @submit="doSubmitChat"
    />
  </div>
</template>
