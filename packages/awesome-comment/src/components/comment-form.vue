<script setup lang="ts">
import { ref } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import useStore from '../store';

const auth0 = useAuth0();

const isSending = ref<boolean>(false);
const comment = ref<string>('');
const message = ref<string>('');

async function doSubmit(event: Event): Promise<void> {
  if (!auth0.user.value) {
    return doLogin();
  }
  if ((event.target as HTMLFormElement).matches(':invalid')) return;

  isSending.value = true;
  try {
    const accessToken = await auth0.getAccessTokenSilently();
    const response = await fetch(__API_URL__ + '/api/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        comment: comment.value,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to post comment');
    }
  } catch (e) {
    message.value = e.message;
  }

  isSending.value = false;
}
function doLogin(): void {
  auth0.loginWithPopup();
}
function onKeydown(event: KeyboardEvent): void {
  const isMac = navigator.userAgent.match(/Macintosh/);
  if (isMac && event.metaKey || !isMac && event.ctrlKey) {
    doSubmit(event);
  }
}
</script>

<template lang="pug">
form.mb-6(
  @submit.prevent="doSubmit"
)
  .form-control.border.border-neutral.bg-base-300.text-neutral-content.rounded-lg
    label.sr-only(
      for="ac-comment"
    ) Your comment
    textarea#ac-comment.textarea.textarea-bordered.bg-base-200.rounded-b-none(
      rows="3"
      placeholder="Write a comment..."
      required
      @keydown.enter="onKeydown"
      v-model="comment"
    )
    .p-2.rounded-b-lg.bg-base-300.flex
      button.btn.btn-primary.btn-sm.ml-auto Post comment
</template>

<script lang="ts">
export default {
  name: 'CommentForm',
}
</script>
