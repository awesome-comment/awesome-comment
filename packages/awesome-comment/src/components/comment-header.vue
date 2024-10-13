<script setup lang="ts">
import type { Comment } from '@awesome-comment/core/types';
import {  EmailAppendixRegex } from '@awesome-comment/core/data';
import { BadgeCheck } from 'lucide-vue-next';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { stringToColor } from '../utils';
import { formatTime } from '../utils/time.ts';

type Props = {
  comment: Comment;
  isEditing: boolean;
  isEditable: boolean;
};
const props = defineProps<Props>();
type Emits = {
  (event: 'edit'): void;
}
const emit = defineEmits<Emits>();

const { t } = useI18n();

const username = computed<string>(() => {
  if (props.comment.isAdmin) return t('admin');

  let name = props.comment.user?.name || t('anonymous');
  // replace email appendix
  name = name.replace(EmailAppendixRegex, '');
  return name;
});


function getCommentLink(id: number): string {
  return `${location.origin}${location.pathname}#awcm-${id}`;
}

</script>

<template>
  <div class="flex items-center gap-2 text-sm text-base-content dark:text-white">
    <div class="ac-avatar">
      <div
        v-if="comment.user.avatar"
        class="w-6 h-6"
      >
        <img
          :alt="username"
          :src="comment.user.avatar"
          class="rounded-full max-w-full max-h-full"
        >
      </div>
      <div
        v-else
        :style="{'background-color': stringToColor(username)}"
        class="avatar-char rounded-full w-6 h-6 text-center"
      >
        <span
          class="text-neutral-content mix-blend-color-dodge uppercase font-bold leading-6"
        >{{ username.substring(0, 1) }}</span>
      </div>
    </div>
    {{ username }}
    <div
      v-if="comment.isAdmin"
      :data-tip="t('admin')"
      class="ac-tooltip text-success"
    >
      <badge-check
        class="block"
        size="18"
      />
    </div>
    <a
      :href="getCommentLink(comment.id as number)"
      class="no-underline hover:underline hover:decoration-green-middle"
    >
      <time
        :datetime="comment.createdAt"
        :title="formatTime(comment.createdAt)"
        class="text-xs text-gray-600 dark:text-gray-400"
      >{{ formatTime(comment.createdAt) }}
      </time>
    </a>
    <button
      v-if="isEditable"
      class="ac-btn ac-btn-link ac-btn-xs hover:no-underline"
      type="button"
      @click="emit('edit')"
    >
      {{ t('edit') }}
    </button>
  </div>
</template>
