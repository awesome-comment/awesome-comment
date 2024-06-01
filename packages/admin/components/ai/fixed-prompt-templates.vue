<script setup lang="ts">
import type { Comment, ResponseBody } from '@awesome-comment/core/types';
import pickBy from 'lodash/pickBy';
import usePromptStore from '~/store/prompt';
import type { AiPromptTemplate } from '~/types';
import { replaceTemplate, writeToClipboard } from '~/utils';

type Props = {
  comment: Comment;
}
const props = defineProps<Props>();

const promptStore = usePromptStore();

const templateId = ref<string>('');
const isUsingTemplate = ref<boolean>(false);
const isLoading = ref<string>('');
const isCopied = ref<string>('');
const fixed = computed<Record<string, AiPromptTemplate>>(() => {
  return pickBy(promptStore.prompts, item => item.isFix);
});
const length = computed<number>(() => Object.keys(fixed.value).length);

async function doUse(id: string): Promise<void> {
  templateId.value = id;
  if (!promptStore.isAutoCopy) {
    isUsingTemplate.value = true;
    return;
  }

  isLoading.value = id;
  const item = promptStore.prompts[ id ];
  if (!item) return;
  let title = '';
  if (item.template.includes('%TITLE%')) {
    const res = await $fetch<ResponseBody<{ title: string }>>('/api/fetch-url?url=' + props.comment.postId);
    title = res.data.title;
  }
  const replaced = replaceTemplate(item.template, props.comment, title);
  await writeToClipboard(replaced);
  isLoading.value = '';
  isCopied.value = id;
  promptStore.setRecentUsage(props.comment.postId, id);
}

onMounted(async () => {
  const promptId = promptStore.recentUsage[ props.comment.postId ];
  if (promptId && fixed.value[ promptId ]) {
    await nextTick();
    doUse(promptId);
  }
});
</script>

<template>
  <div
    v-if="length"
    class="flex flex-wrap gap-1 items-center mb-4"
  >
    <button
      v-for="(template, id) in fixed"
      :key="id"
      type="button"
      class="btn btn-xs btn-outline text-white"
      :class="isCopied === id ? 'btn-success' : 'btn-info'"
      :disabled="!!isLoading"
      @click="doUse(id)"
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
  </div>

  <ai-use-template
    v-if="isUsingTemplate"
    v-model:is-open="isUsingTemplate"
    :prompt-id="templateId"
    :comment="comment"
  />
</template>
