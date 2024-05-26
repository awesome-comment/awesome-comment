<script setup lang="ts">
import pickBy from 'lodash/pickBy';
import usePromptStore from '~/store/prompt';
import type { AiPromptTemplate } from '~/types';

type Props = {
  comment: Comment;
}
const props = defineProps<Props>();

const promptStore = usePromptStore();

const templateId = ref<string>('');
const isUsingTemplate = ref<boolean>(false);
const fixed = computed<Record<string, AiPromptTemplate>>(() => {
  return pickBy(promptStore.prompts, item => item.isFix);
});
const length = computed<number>(() => Object.keys(fixed.value).length);

function doUse(id: string): void {
  templateId.value = id;
  isUsingTemplate.value = true;
}
</script>

<template>
  <div
    v-if="length"
    class="flex items-center mb-4"
  >
    <button
      v-for="(template, id) in fixed"
      :key="id"
      type="button"
      class="btn btn-xs btn-info btn-outline"
      @click="doUse(id)"
    >
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
