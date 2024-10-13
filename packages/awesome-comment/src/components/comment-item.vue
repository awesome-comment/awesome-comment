<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import CommentForm from './comment-form.vue';
import useStore from '../store';
import CommentActions from './comment-actions.vue';
import CommentContent from './comment-content.vue';
import CommentHeader from './comment-header.vue';

type Props = {
  comment: Comment;
  isFirstLevel: boolean;
  ancestorId?: number;
};
const props = defineProps<Props>();

const { t } = useI18n();
const store = useStore();
const { user } = useAuth0();
let interval: ReturnType<typeof setInterval>;

const now = ref<number>(Date.now());
const isEditing = ref<boolean>(false);
const isReplying = ref<boolean>(false);
const isEditable = computed<boolean>(() => {
  return props.comment.userId === user.value?.sub
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
    :class="{'animated flash': comment.isNew}"
    class="comment-item rounded-lg my-4 target:outline target:outline-green-500 target:outline-2 dark:target:outline-1"
    @animationend="store.updateComment(comment.id as number, { isNew: false })"
  >
    <div class="pt-2 pb-3 px-4 text-base bg-base-200 rounded-lg dark:bg-gray-900">
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
      class="mt-3 ms-7"
      no-version
      @close="isReplying = false"
    />
    <template v-if="comment.children?.length">
      <comment-item
        v-for="child in comment.children"
        :key="child.id"
        :ancestor-id="ancestorId"
        :comment="child"
        :is-first-level="false"
        class="ms-7 mt-2"
      />
    </template>
    <comment-form
      v-if="isReplying && !isFirstLevel"
      :ancestor-id="ancestorId"
      :parent-id="comment.id"
      class="mt-3 ms-7"
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
