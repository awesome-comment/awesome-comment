<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { marked } from 'marked';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus, EmailAppendixRegex } from '@awesome-comment/core/data';
import { stringToColor } from '../utils';
import { formatTime } from '../utils/time.ts';
import CommentForm from './comment-form.vue';
import useStore from '../store';

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
const isEditable = computed<boolean>(() => {
  return props.comment.userId === user.value?.sub
    && now.value - props.comment.createdAt.getTime() < 36E5;
});
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
function getParentUserName(id: number): string {
  if (props.ancestorId) {
    const ancestor = store.comments[ props.ancestorId ];
    const parent = ancestor?.children?.find((c) => Number(c.id) === Number(id));
    return parent.isAdmin ? t('admin') : (parent?.user?.name || parent?.user?.email || '');
  }
  return '';
}

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

<template lang="pug">
.comment-item.rounded-lg.my-4(
  class="target:outline target:outline-green-500 target:outline-2 dark:target:outline-1"
  :id="'awcm-' + comment.id"
  :class="{'animated flash': comment.isNew}"
  @animationend="comment.isNew = false"
)
  .pt-2.pb-3.px-4.text-base.bg-base-200.rounded-lg(class="dark:bg-gray-900")
    header.flex.justify-between.items-center.font-sans
      .flex.items-center.text-sm.text-base-content(
        class="dark:text-white"
      )
        .ac-avatar.me-2
          .w-6.h-6(v-if="comment.user.avatar")
            img.rounded-full.max-w-full.max-h-full(
              :src="comment.user.avatar"
              :alt="username"
            )
          .avatar-char.rounded-full.w-6.h-6.text-center(
            v-else
            :style="{'background-color': stringToColor(username)}"
          )
            span.text-neutral-content.mix-blend-color-dodge.uppercase.font-bold.leading-6 {{username.substring(0, 1)}}
        | {{username}}
        .ac-tooltip.ms-2(
          v-if="comment.isAdmin"
          :data-tip="t('admin')"
        )
          i.bi.bi-patch-check-fill.text-success
        a.ms-4.no-underline(
          class="hover:underline hover:decoration-green-middle"
          :href="getCommentLink(comment.id)"
        )
          time.text-xs.text-gray-600(
            class="dark:text-gray-400"
            :datetime="comment.createdAt"
            :title="formatTime(comment.createdAt)"
          ) {{formatTime(comment.createdAt)}}
        //- edit button
        button.ac-btn.ac-btn-link.ac-btn-xs.ms-4(
          v-if="isEditable"
          class="hover:no-underline"
          type="button"
          @click="isEditing = !isEditing"
        ) {{t('edit')}}

      //- reply button
      button.ac-btn.ac-btn-sm.ac-btn-circle.border-0(
        type="button"
        class="-me-1.5"
        :title="t('reply')"
        :aria-label="t('reply')"
        @click="comment.isReplying = !comment.isReplying"
      )
        i.bi.bi-reply-fill.h-4.w-4
    template(v-if="comment.isAdmin")
      a.inline-block.px-2.py-1.rounded-lg.mt-2.bg-base-300.text-gray-500(
        v-if="comment.parentId && comment.parentId !== comment.ancestorId"
        class="dark:bg-neutral-400/20 dark:text-gray-400"
        :href="`#awcm-${comment.parentId}`"
        target="_self"
      ) @{{getParentUserName(comment.parentId)}}
      article.text-gray-500.break-words.overflow-x-auto(
        class="dark:text-gray-400"
        v-html="marked(comment.content)"
      )
    p.text-gray-500.break-words.overflow-x-auto.whitespace-pre-line.pb-3.mb-0(
      v-else
      class="dark:text-gray-400"
    )
      a.inline-block.px-2.py-1.rounded-lg.me-1.bg-base-300.text-gray-500(
        v-if="comment.parentId && comment.parentId !== comment.ancestorId"
        class="dark:bg-neutral-400/20 dark:text-gray-400"
        :href="`#awcm-${comment.parentId}`"
        target="_self"
      ) @{{getParentUserName(comment.parentId)}}
      | {{comment.content}}
    p.italic.mt-4.text-emerald-600.mb-0.text-sm(
      v-if="comment.status === CommentStatus.Pending"
      class="dark:text-emerald-300"
    ) {{t('approve_hint')}}
  comment-form.mt-3(
    v-if="isEditing"
    no-version
    :content="comment.content"
    :current-id="comment.id"
    :status="comment.status"
    @update="comment.content = $event"
    @close="isEditing = false"
  )
  comment-form.mt-3.ms-7(
    v-if="comment.isReplying && isFirstLevel"
    no-version
    :ancestor-id="ancestorId"
    :parent-id="Number(comment.id)"
    @close="comment.isReplying = false"
  )
  template(v-if="comment.children?.length")
    comment-item.ms-7.mt-2(
      v-for="child in comment.children"
      :key="child.id"
      :comment="child"
      :ancestor-id="ancestorId"
      :is-first-level="false"
    )
  comment-form.mt-3.ms-7(
    v-if="comment.isReplying && !isFirstLevel"
    no-version
    :ancestor-id="ancestorId"
    :parent-id="comment.id"
    @close="comment.isReplying = false"
  )
</template>

<script lang="ts">
export default {
  name: 'CommentItem',
}
</script>
