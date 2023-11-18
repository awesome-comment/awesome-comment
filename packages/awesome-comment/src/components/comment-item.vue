<script setup lang="ts">
import snarkdown from 'snarkdown';
import { useI18n } from 'vue-i18n';
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { stringToColor } from '../utils';
import { formatTime } from '../utils/time.ts';
import CommentForm from './comment-form.vue';
import useStore from '../store';

const { t } = useI18n();
const store = useStore();

const props = defineProps<{
  comment: Comment;
  isFirstLevel: boolean;
  ancestorId?: number;
}>();

function getCommentLink(id: number): string {
  return `${location.origin}${location.pathname}#awcm-${id}`;
}
function getParentUserName(id: number): string {
  if (props.ancestorId) {
    const ancestor = store.comments[ props.ancestorId ];
    const parent = ancestor?.children?.find((c) => Number(c.id) === Number(id));
    return parent?.user?.name || '';
  }
  return '';
}
</script>

<template lang="pug">
.comment-item.rounded-lg.my-4(
  :id="'awcm-' + comment.id"
  :class="{'animated flash': comment.isNew}"
  @animationend="comment.isNew = false"
)
  article.p-6.text-base.bg-base-200.rounded-lg(class="dark:bg-gray-900")
    header.flex.justify-between.items-center.font-sans.mb-2
      .flex.items-center.text-sm.text-base-content(
        class="dark:text-white"
      )
        .ac-avatar.mr-2
          .w-6.h-6(v-if="comment.user.avatar")
            img.rounded-full.max-w-full.max-h-full(
              :src="comment.user.avatar"
              :alt="comment.user.name"
            )
          .avatar-char.rounded-full.w-6.h-6.text-center(
            v-else
            :style="{'background-color': stringToColor(comment.user.name || t('anonymous'))}"
          )
            span.text-neutral-content.mix-blend-color-dodge.uppercase.font-bold.leading-6 {{(comment.user.name || t('anonymous')).substring(0, 1)}}
        | {{comment.user.name}}
        .ac-tooltip.ml-2(
          v-if="comment.isAdmin"
          :data-tip="t('admin')"
        )
          i.bi.bi-patch-check-fill.text-success
        a.ml-4.no-underline(
          class="hover:underline"
          :href="getCommentLink(comment.id)"
        )
          time.text-xs.text-gray-600(
            class="dark:text-gray-400"
            pubdate
            :datetime="comment.createdAt"
            :title="formatTime(comment.createdAt)"
          ) {{formatTime(comment.createdAt)}}
        a.text-xs.link.link-hover.ml-4(
          v-if="!isFirstLevel && comment.parent_id !== comment.ancestor_id"
          :href="'#awcm-' + comment.parent_id"
        ) {{t('reply_to')}} {{getParentUserName(comment.parent_id)}}(\#{{ comment.parent_id }})

      //- reply button
      button.ac-btn.ac-btn-sm.ac-btn-circle.border-0(
        type="button"
        :title="t('reply')"
        :aria-label="t('reply')"
        @click="comment.isReplying = !comment.isReplying"
      )
        i.bi.bi-reply-fill.h-4.w-4
    p.text-gray-500.break-words(
      class="dark:text-gray-400"
      v-html="snarkdown(comment.content)"
    )
    p.italic.mt-4.text-gray-500.mb-0.text-sm(
      v-if="comment.status === CommentStatus.Pending"
      class="dark:text-gray-400"
    ) {{t('approve_hint')}}
  comment-form.mt-3.ml-12(
    v-if="comment.isReplying && isFirstLevel"
    no-version
    :ancestor-id="ancestorId"
    :parent-id="Number(comment.id)"
    @close="comment.isReplying = false"
  )
  template(v-if="comment.children?.length")
    comment-item.ml-12(
      v-for="child in comment.children"
      :key="child.id"
      :comment="child"
      :ancestor-id="ancestorId"
      :is-first-level="false"
    )
  comment-form.mt-3.ml-12(
    v-if="comment.isReplying && !isFirstLevel"
    no-version
    :ancestor-id="ancestorId"
    :parent-id="comment.id"
  )
</template>

<script lang="ts">
export default {
  name: 'CommentItem',
}
</script>
