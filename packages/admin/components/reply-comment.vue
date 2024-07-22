<script setup lang="ts">
import type { UiModal } from '#components';
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { withCommandModifier } from '@awesome-comment/core/utils';
import { useAuth0 } from '@auth0/auth0-vue';

type Props = {
  comment: Comment,
}
const props = defineProps<Props>();
type Emits = {
  (event: 'reply', reply: Comment): void;
  (event: 'open'): void;
  (event: 'close'): void;
}
const emit = defineEmits<Emits>();
const auth0 = useAuth0();
const Emojis = ['❤️', '👍', '😂'];

const modal = ref<UiModal>();
const textarea = ref<HTMLTextAreaElement>();

const hasModal = ref<boolean>(false);
const isReplying = ref<boolean>(false);
const message = ref<string>('');
const reply = ref<string>('');

async function doOpenModal(): Promise<void> {
  hasModal.value = true;
  await nextTick();
  emit('open');
}
async function doReply(event: Event): Promise<void> {
  if (isReplying.value || (event.target as HTMLFormElement).matches(':invalid')) return;

  isReplying.value = true;
  message.value = '';
  const content = reply.value.trim();
  if (!content) return;

  try {
    const accessToken = await auth0.getAccessTokenSilently();
    const { data } = await $fetch('/api/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        comment: content,
        postId: props.comment.postId,
        ancestorId: props.comment.ancestorId || props.comment.id,
        parentId: props.comment.id,
        status: props.comment.status,
      },
    });
    emit('reply', {
      id: data.id,
      content: content,
      postId: props.comment.postId,
      parentId: props.comment.id,
      ancestorId: props.comment.ancestorId || props.comment.id,
      status: CommentStatus.Approved,
      createdAt: new Date(),
      user: {
        email: auth0.user.value?.email,
        name: auth0.user.value?.name,
      },
    } as Comment);
    reply.value = '';
    modal.value.close();
  } catch (e) {
    message.value = (e as Error).message || String(e);
  }
  isReplying.value = false;
}
async function doInsertEmoji(emoji: string): Promise<void> {
  // insert emoji at cursor position
  if (!textarea.value) return;

  textarea.value.focus();
  const { selectionStart, selectionEnd } = textarea.value;
  const text = reply.value;
  const before = text.substring(0, selectionStart);
  const after = text.substring(selectionEnd);
  reply.value = before + emoji + after;
  await nextTick();
  textarea.value.selectionStart = textarea.value.selectionEnd = selectionStart + emoji.length;
}
function doInsertUsername(): void {
  let username = props.comment.user.name || props.comment.user.email;
  username = username.split(' ')[ 0 ];
  if (username.includes('@')) {
    username = username.split('@')[ 0 ];
  }
  doInsertEmoji(`Hi ${username}, `);
}

function onClose(): void {
  hasModal.value = false;
  emit('close');
}
function onKeydown(event: KeyboardEvent): void {
  if (withCommandModifier(event, 'Enter')) {
    doReply(event);
  }
}
function onAiOutput(text: string): void {
  reply.value += text;
}

defineExpose({
  doOpenModal,
});
</script>

<template lang="pug">
ui-modal(
  ref="modal"
  button-class="btn-info btn-sm sm:btn-xs text-white hover:text-white"
  modal-class="w-11/12 max-w-3xl"
  :disabled="isReplying"
  :title="comment.postId"
  @close="onClose"
)
  template(#button)
    span.loading.loading-xs.loading-spinner(v-if="isReplying")
    | Reply

  form(
    @submit.prevent="doReply"
  )
    blockquote.mb-2.border-l-2.border-gray-200.bg-base-200.ps-2.py-2.max-h-64.overflow-auto.rounded-r-box {{comment.content}}
    .form-control.mb-4
      .label
        label.label-text Your replyment
          ai-reply-helper(
            :comment="comment"
            :reply="reply"
          )
        .label-text-alt
          button.btn.btn-xs.btn-ghost.text-success(
            type="button"
            @click="doInsertUsername"
          ) [Name]
          button.btn.btn-xs.btn-ghost.btn-square(
            v-for="item in Emojis"
            :key="item"
            type="button"
            @click="doInsertEmoji(item)"
          ) {{item}}

      textarea.textarea.textarea-bordered(
        ref="textarea"
        rows="16"
        v-model="reply"
        required
        @keydown="onKeydown"
      )
    .alert.alert-error.mb-4(v-if="message")
      p {{message}}
    ai-fixed-prompt-templates(
      :comment="comment"
      :reply="reply"
      @ai="onAiOutput"
    )
    footer.flex.justify-end
      button.btn.btn-primary.btn-sm.text-white.min-w-64(
        class="hover:text-white"
        :disabled="isReplying"
      )
        span.loading.loading-spinner(v-if="isReplying")
        | Reply
</template>
