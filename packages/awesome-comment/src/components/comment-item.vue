<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import CommentForm from './comment-form.vue';
import useStore from '../store';
import CommentActions from './comment-actions.vue';
import CommentContent from './comment-content.vue';
import CommentHeader from './comment-header.vue';
import useAuthStore from '../store/auth.ts';

type Props = {
  comment: Comment;
  isFirst?: boolean;
  isFirstLevel: boolean;
  isLast?: boolean;
  ancestorId?: number;
};
const props = defineProps<Props>();

const { t } = useI18n();
const store = useStore();
const authStore = useAuthStore();
let interval: ReturnType<typeof setInterval>;

const now = ref<number>(Date.now());
const isEditing = ref<boolean>(false);
const isReplying = ref<boolean>(false);
const isEditable = computed<boolean>(() => {
  return props.comment.userId === authStore.user?.sub
    && now.value - props.comment.createdAt.getTime() < 36E5;
});

onMounted(() => {
  if (!isEditable.value) return;

  interval = setInterval(() => {
    now.value = Date.now();
    if (!isEditable.value) {
      clearInterval(interval);
    }
  }, 1000);
});
onBeforeUnmount(() => {
  clearInterval(interval);
});
</script>

<template>
  <div
    :id="'awcm-' + comment.id"
    :class="[{'animated flash': comment.isNew}, isFirstLevel ? 'mb-4' : (isFirst ? '-mt-4' : 'mt-1')]"
    class="comment-item target:outline target:outline-green-500 target:outline-2 dark:target:outline-1"
    @animationend="store.updateComment(comment.id as number, { isNew: false })"
  >
    <div
      class="pt-2 px-4 text-base bg-base-200 dark:bg-gray-900"
      :class="[{'rounded-lg': isFirstLevel, 'rounded-b-lg': isLast, 'rounded-t-lg shadow-outline-md': isFirst}, comment.children?.length ? 'pb-6' : 'pb-3']"
    >
      <header class="flex justify-between items-center font-sans">
        <comment-header
          :comment="comment"
          :is-editable="isEditable"
          :is-editing="isEditing"
          @edit="isEditing = !isEditing"
        />
        <comment-actions
          :comment="comment"
          @reply="isReplying = !isReplying"
        />
      </header>
      <comment-content
        :ancestor-id="ancestorId as number"
        :comment="comment"
      />

      <p
        v-if="comment.status === CommentStatus.Pending"
        class="italic mt-4 text-emerald-600 mb-0 text-sm dark:text-emerald-300"
      >
        {{ t('approve_hint') }}
      </p>
    </div>
    <comment-form
      v-if="isEditing"
      :content="comment.content"
      :current-id="comment.id"
      :status="comment.status"
      class="mt-3"
      no-version
      @close="isEditing = false"
      @update="store.updateComment(comment.id as number, { content: $event})"
    />
    <comment-form
      v-if="isReplying && isFirstLevel"
      :ancestor-id="ancestorId"
      :parent-id="Number(comment.id)"
      class="mt-2 ms-7"
      no-version
      @close="isReplying = false"
    />
    <template v-if="comment.children?.length">
      <comment-item
        v-for="(child, index) in comment.children"
        :key="child.id"
        :ancestor-id="ancestorId"
        :comment="child"
        :is-first="index === 0"
        :is-first-level="false"
        :is-last="index === comment.children.length - 1"
        class="ms-7"
      />
    </template>
    <comment-form
      v-if="isReplying && !isFirstLevel"
      :ancestor-id="ancestorId"
      :parent-id="comment.id"
      class="mt-2 ms-7"
      no-version
      @close="isReplying = false"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: 'CommentItem',
}
</script>
