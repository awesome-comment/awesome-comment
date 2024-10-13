<script setup lang="ts">
import type { Comment, ResponseBody } from '@awesome-comment/core/types';
import { Reply, ThumbsUp, ThumbsDown } from 'lucide-vue-next';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import useStore from '../store';

type Props = {
  comment: Comment;
}
const props = defineProps<Props>();
type Emits = {
  (event: 'reply'): void;
}
const emit = defineEmits<Emits>();

const { t } = useI18n();
const store = useStore();

const isSending = ref<number>(0);

async function doLike(isLike = true) {
  if (isSending.value) return;

  isSending.value = isLike ? 1 : -1;
  const response = await fetch(`/api/like/${props.comment.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ like: isLike }),
  });
  const json = (await response.json()) as ResponseBody<{ like: number }>;
  store.updateComment(props.comment.id as number, {
    like: json.data.like,
  });
  isSending.value = 0;
}
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      :aria-label="t('like')"
      :title="t('like')"
      class="ac-btn ac-btn-sm ac-btn-circle border-0 shadow-none"
      :disabled="isSending"
      type="button"
      @click="doLike()"
    >
      <span v-if="isSending > 0" class="ac-loading ac-loading-spinner" />
      <thumbs-up v-else size="16" />
    </button>
    <span class="text-sm">0</span>
    <button
      :aria-label="t('like')"
      :title="t('like')"
      class="ac-btn ac-btn-sm ac-btn-circle border-0 shadow-none"
      :disabled="isSending"
      type="button"
      @click="doLike(false)"
    >
      <span v-if="isSending < 0" class="ac-loading ac-loading-spinner" />
      <thumbs-down v-else size="16" />
    </button>

    <button
      :aria-label="t('reply')"
      :title="t('reply')"
      class="ac-btn ac-btn-sm ac-btn-circle border-0 shadow-none -me-1.5"
      type="button"
      @click="emit('reply')"
    >
      <Reply size="16" />
    </button>
  </div>
</template>
