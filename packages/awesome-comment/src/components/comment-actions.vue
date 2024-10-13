<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import type { Comment, ResponseBody } from '@awesome-comment/core/types';
import { Reply, ThumbsUp, ThumbsDown } from 'lucide-vue-next';
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

const auth0 = useAuth0();
const { t } = useI18n();
const store = useStore();

async function doLike(isLike = true) {
  const accessToken = await auth0.getAccessTokenSilently();
  const response = await fetch(`/api/like/${props.comment.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ isLike }),
  });
  const json = (await response.json()) as ResponseBody<{ like: number }>;
  store.updateComment(props.comment.id as number, {
    like: json.data.like,
  });
}
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      :aria-label="t('like')"
      :title="t('like')"
      class="ac-btn ac-btn-sm ac-btn-circle border-0 shadow-none"
      type="button"
      @click="doLike()"
    >
      <thumbs-up size="16" />
    </button>
    <span class="text-sm">0</span>
    <button
      :aria-label="t('like')"
      :title="t('like')"
      class="ac-btn ac-btn-sm ac-btn-circle border-0 shadow-none"
      type="button"
      @click="doLike(false)"
    >
      <thumbs-down size="16" />
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
