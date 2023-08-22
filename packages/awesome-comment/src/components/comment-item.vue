<script setup lang="ts">
import snarkdown from 'snarkdown';
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { stringToColor } from '../utils';
import { formatTime } from '../utils/time.ts';
import CommentForm from './comment-form.vue';

defineProps<{
  comment: Comment;
  isFirstLevel: boolean;
  ancestorId?: number;
}>();
</script>

<template lang="pug">
.comment-item.rounded-lg.my-4(
  :class="{'animated flash': comment.isNew}"
  @animationend="comment.isNew = false"
)
  article.p-6.text-base.bg-base-200.rounded-lg(class="dark:bg-gray-900")
    header.flex.justify-between.items-center.mb-2
      .flex.items-center.text-sm.text-base-content(
        class="dark:text-white"
      )
        .avatar.mr-2
          img.w-6.h-6.rounded-full(
            v-if="comment.user.avatar"
            :src="comment.user.avatar"
            :alt="comment.user.name"
          )
          .avatar-char.rounded-full.w-6.h-6.mr-2.text-center(
            v-else
            :style="{'background-color': stringToColor(comment.user.name || 'Anonymous')}"
          )
            span.text-neutral-content.mix-blend-color-dodge.uppercase.font-bold.leading-6 {{(comment.user.name || 'Anonymous').substring(0, 1)}}
        | {{comment.user.name}}
        time.text-xs.text-gray-600.ml-4(
          class="dark:text-gray-400"
          pubdate
          :datetime="comment.createdAt"
          :title="comment.createdAt"
        ) {{formatTime(comment.createdAt)}}

      //- reply button
      button.ac-btn.ac-btn-sm.ac-btn-circle.border-0(
        type="button",
        @click="comment.isReplying = !comment.isReplying"
      )
        svg(xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 bi bi-reply-fill" fill="none" stroke="currentColor" viewBox="0 0 16 16")
          path(d="M5.921 11.9 1.353 8.62a.719.719 0 0 1 0-1.238L5.921 4.1A.716.716 0 0 1 7 4.719V6c1.5 0 6 0 7 8-2.5-4.5-7-4-7-4v1.281c0 .56-.606.898-1.079.62z")
    p.text-gray-500(
      class="dark:text-gray-400"
      v-html="snarkdown(comment.content)"
    )
    p.italic.mt-4.text-gray-500.mb-0.text-sm(
      v-if="comment.status === CommentStatus.Pending"
      class="dark:text-gray-400"
    ) comments normally got approved within 24 hours
  comment-form.mt-3.ml-12(
    v-if="comment.isReplying && isFirstLevel"
    :ancestor-id="Number(ancestorId)"
    :parent-id="Number(comment.id)"
  )
  template(v-if="comment.children?.length")
    comment-item.ml-12(
      v-for="child in comment.children"
      :key="child.id"
      :comment="child"
      :is-first-level="false"
    )
  comment-form.mt-3.ml-12(
    v-if="comment.isReplying && !isFirstLevel"
    :ancestor-id="Number(ancestorId)"
    :parent-id="Number(comment.id)"
  )
</template>

<script lang="ts">
export default {
  name: 'CommentItem',
}
</script>
