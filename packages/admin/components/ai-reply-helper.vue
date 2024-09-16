<script setup lang="ts">
import type { Comment } from '@awesome-comment/core/types';
import usePromptStore from '~/store/prompt';

type Props = {
  comment: Comment;
  reply: string;
}
const props = defineProps<Props>();
type Emits = {
  (event: 'ai', text: string): void;
}
const emit = defineEmits<Emits>();

const promptStore = usePromptStore();

onBeforeMount(() => {
  promptStore.init();
});
</script>

<template>
  <div class="flex items-center gap-4 mb-4">
    <ai-prompt-management />
  </div>
</template>
