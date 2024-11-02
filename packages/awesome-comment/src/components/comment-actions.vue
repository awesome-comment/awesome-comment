<script setup lang="ts">
import type { Comment, ResponseBody } from '@awesome-comment/core/types';
import { Reply, ThumbsUp, ThumbsDown } from 'lucide-vue-next';
import { inject, ref } from 'vue';
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

const store = useStore();
const { t } = useI18n();
const baseUrl = inject('ApiBaseUrl');
const LOCAL_STORAGE_KEY = 'awesome-comment-likes';

const isSending = ref<number>(0);

async function doLike(isLike = true) {
  if (isSending.value) return;
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    const liked: Record<number, number> = JSON.parse(local);
    const now = Date.now();
    const lastTime = liked[ props.comment.id as number ];
    liked[ props.comment.id as number ] = now;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(liked));
    if (lastTime && now - lastTime < 6E4) {
      // fake vote, cheat the user
      store.updateComment(props.comment.id as number, {
        like: Math.max((props.comment.like || 0) + (isLike ? 1 : -1), 0),
      });
      return;
    }
  } else {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ [ props.comment.id as number ]: Date.now() }));
  }

  isSending.value = isLike ? 1 : -1;
  const response = await fetch(`${baseUrl}/api/like/${props.comment.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      like: isLike,
      postId: props.comment.postId,
    }),
  });
  const json = (await response.json()) as ResponseBody<{ like: number }>;
  store.updateComment(props.comment.id as number, {
    like: json.data?.like || 0,
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
      :disabled="isSending !== 0"
      type="button"
      @click="doLike()"
    >
      <span
        v-if="isSending > 0"
        class="ac-loading ac-loading-spinner"
      />
      <thumbs-up
        v-else
        :size="16"
      />
    </button>
    <span class="text-sm text-gray-500 dark:text-gray-400">{{ comment.like || 0 }}</span>
    <button
      :aria-label="t('dislike')"
      :title="t('dislike')"
      class="ac-btn ac-btn-sm ac-btn-circle border-0 shadow-none"
      :disabled="isSending !== 0"
      type="button"
      @click="doLike(false)"
    >
      <span
        v-if="isSending < 0"
        class="ac-loading ac-loading-spinner"
      />
      <thumbs-down
        v-else
        :size="16"
      />
    </button>

    <button
      :aria-label="t('reply')"
      :title="t('reply')"
      class="ac-btn ac-btn-sm ac-btn-circle border-0 shadow-none -me-1.5"
      type="button"
      @click="emit('reply')"
    >
      <Reply :size="16" />
    </button>
  </div>
</template>
