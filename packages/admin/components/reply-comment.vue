<script setup lang="ts">
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { useAuth0 } from '@auth0/auth0-vue';

type Props = {
  comment: Comment,
}
const props = defineProps<Props>();
type Emits = {
  (event: 'reply', reply: Comment): (event: Event) => boolean | void;
}
const emit = defineEmits<Emits>();
const auth0 = useAuth0();

const modal = ref<HTMLDialogElement>();

const hasModal = ref<boolean>(false);
const isReplying = ref<boolean>(false);
const message = ref<string>('');
const reply = ref<string>('');

async function doOpenModal(): Promise<void> {
  hasModal.value = true;
  await nextTick();
  modal.value?.showModal();
}
async function doReply(event: Event): Promise<void> {
  if (isReplying.value || (event.target as HTMLFormElement).matches(':invalid')) return;

  isReplying.value = true;
  message.value = '';
  try {
    const accessToken = await auth0.getAccessTokenSilently();
    const { data } = await $fetch('/api/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        comment: reply.value,
        postId: props.comment.postId,
        ancestorId: props.comment.ancestorId || props.comment.id,
        parentId: props.comment.id,
        status: props.comment.status,
      },
    });
    emit('reply', {
      id: data.id,
      content: reply.value,
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

defineExpose({
  doOpenModal,
});
</script>

<template lang="pug">
button.btn.btn-success.btn-sm(
  type="button",
  class="sm:btn-xs"
  :disabled="isReplying"
  @click="doOpenModal"
)
  span.loading.loading-xs.loading-spinner(v-if="isReplying")
  | Reply

teleport(
  v-if="hasModal"
  to="body"
)
  dialog.modal(
    ref="modal"
    :id="'comment-' + comment.id"
  )
    form.modal-box(
      @submit.prevent="doReply"
    )
      .mb-2 Reply to
      blockquote.mb-2.border-l-2.border-gray-200.bg-base-200.pl-2.py-2 {{comment.content}}
      .form-control.mb-4
        label.label
          span.label-text Your replyment
        textarea.textarea.textarea-bordered(
          rows="3"
          v-model="reply"
          required
        )
      .alert.alert-error.mb-4(v-if="message")
        p {{message}}
      footer.flex.justify-end
        button.btn.btn-primary(
          :disabled="isReplying"
        )
          span.loading.loading-spinner(v-if="isReplying")
          | Reply
    form.modal-backdrop(
      method="dialog"
    )
      button close
</template>
