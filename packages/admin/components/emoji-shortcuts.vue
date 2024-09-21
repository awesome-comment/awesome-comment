<script setup lang="ts">
import { clickWithModifier } from '@awesome-comment/core/utils';
import { useAuth0 } from '@auth0/auth0-vue';
import { ShortcutEmojis } from '~/data';
import useConfigStore from '~/store';
import usePromptStore from '~/store/prompt';

const isReplying = defineModel<string>('isReplying', {
  default: '',
});
type Emits = {
  (event: 'reply', content: string, isPreview: boolean): void;
}
const emit = defineEmits<Emits>();

const auth0 = useAuth0();
const configStore = useConfigStore();
const promptStore = usePromptStore();

const shortcuts = computed<{key: string, id: string}[]>(() => {
  return Object.entries(configStore.myConfig.aiTemplateShortcuts)
    .reduce((acc, [key, id]) => {
      if (!(id in promptStore.prompts)) return acc;

      acc.push({ key, id });
      return acc;
    }, [] as { key: string, id: string }[]);
});

async function doReply(emoji: string, event?: MouseEvent): Promise<void> {
  if (isReplying.value) return;

  const isPreviewPrompt = clickWithModifier(event);
  emit('reply', emoji, isPreviewPrompt);
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
      @click="doReply(item)"
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
      :disabled="!!isReplying"
      @click="doReply(item.id, $event)"
    >
      <span
        v-if="isReplying === item.id"
        class="loading loading-spinner"
      />
      <span v-else>{{ item.key }}</span>
    </button>
  </div>
</template>
