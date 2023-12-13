<script setup lang="ts">
import type { Comment } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { useAuth0 } from '@auth0/auth0-vue';

type Props = {
  comment: Comment,
}
const props = defineProps<Props>();
type Emits = {
  (event: 'save', content: string): (event: Event) => boolean | void;
}
const emit = defineEmits<Emits>();
const auth0 = useAuth0();

const modal = ref<HTMLDialogElement>();

const isSaving = ref<boolean>(false);
const hasModal = ref<boolean>(false);
const message = ref<string>('');
const newContent = ref<string>(props.comment.content);

async function doOpenModal(): Promise<void> {
  hasModal.value = true;
  await nextTick();
  modal.value?.showModal();
}
async function doReply(event: Event): Promise<void> {
  if (isSaving.value || (event.target as HTMLFormElement).matches(':invalid')) return;

  isSaving.value = true;
  message.value = '';
  try {
    const accessToken = await auth0.getAccessTokenSilently();
    await $fetch('/api/admin/comment/' + props.comment.id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        content: newContent.value,
      },
    });
    emit('save', newContent.value);
    modal.value.close();
  } catch (e) {
    message.value = (e as Error).message || String(e);
  }
  isSaving.value = false;
}
</script>

<template lang="pug">
button.btn.btn-warning.btn-sm(
  type="button",
  class="sm:btn-xs"
  :disabled="isSaving"
  @click="doOpenModal"
)
  span.loading.loading-xs.loading-spinner(v-if="isSaving")
  | Edit

teleport(
  v-if="hasModal"
  to="body"
)
  dialog.modal(
    ref="modal"
    :id="'comment-' + comment.id"
    @close="hasModal = false"
  )
    form.modal-box(
      @submit.prevent="doReply"
    )
      .mb-2 Edit
      blockquote.mb-2.border-l-2.border-gray-200.bg-base-200.pl-2.py-2 {{comment.content}}
      .form-control.mb-4
        label.label
          span.label-text New content
        textarea.textarea.textarea-bordered(
          rows="3"
          v-model="newContent"
          required
        )
      .alert.alert-error.mb-4(v-if="message")
        p {{message}}
      footer.flex.justify-end
        button.btn.btn-primary(
          :disabled="isSaving"
        )
          span.loading.loading-spinner(v-if="isSaving")
          i.bi.bi-check-lg(v-else)
          | Save
    form.modal-backdrop(
      method="dialog"
    )
      button close
</template>
