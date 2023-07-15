<script setup lang="ts">
import { inject, ref } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import type { ResponseBody } from '@awesome-comment/core/types';
import useStore from '../store';

const auth0 = useAuth0();
const store = useStore();
const baseUrl = inject('ApiBaseUrl');
const auth0domain = inject('Auth0Domain');
const version = __VERSION__;

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
    const response = await fetch<ResponseBody<number>>(baseUrl + '/api/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        comment: comment.value,
        postId: store.postId,
        domain: auth0domain,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to post comment');
    }

    const json = await response.json();
    store.addComment(json.data, comment.value, auth0.user.value);
    comment.value = '';
  } catch (e) {
    message.value = (e as Error).message || String(e);
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
  .ac-form-control.border.border-neutral.bg-base-200.rounded-lg
    label.sr-only(
      for="ac-comment"
    ) Your comment
    textarea#ac-comment.ac-textarea.ac-textarea-bordered.bg-base-200.rounded-b-none(
      rows="3"
      placeholder="Write a comment..."
      required
      @keydown.enter="onKeydown"
      v-model="comment"
    )
    .p-2.rounded-b-lg.bg-base-300.flex.items-center
      .text-xs(class="text-neutral/50") v{{version}}
      .ac-alert.ac-alert-error.mx-4(v-if="message")
        p {{message}}
      button.ac-btn.ac-btn-primary.ac-btn-sm.ml-auto(
        :disabled="isSending"
      )
        span.ac-loading.ac-loading-spinner(v-if="isSending")
        | Post comment
</template>

<script lang="ts">
export default {
  name: 'CommentForm',
}
</script>
