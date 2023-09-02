<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import type { ResponseBody } from '@awesome-comment/core/types';
import useStore from '../store';

type Props = {
  noVersion?: boolean;
  parentId?: number | string;
  ancestorId?: number | string;
}
const props = defineProps<Props>();
type Emits = {
  (event: 'close'): (event: Event) => boolean | void;
}
const emit = defineEmits<Emits>();

const auth0 = useAuth0();
const store = useStore();
const baseUrl = inject('ApiBaseUrl');
const auth0domain = inject('Auth0Domain');
const version = __VERSION__;
const textarea = ref<HTMLTextAreaElement>();

const isSending = ref<boolean>(false);
const comment = ref<string>('');
const message = ref<string>('');

async function doSubmit(event: Event): Promise<void> {
  if (!auth0.user.value) {
    return doLogin();
  }
  if ((event.target as HTMLFormElement).matches(':invalid')) return;

  isSending.value = true;
  message.value = '';
  try {
    const accessToken = await auth0.getAccessTokenSilently();
    const response = await fetch(baseUrl + '/api/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        comment: comment.value,
        postId: store.postId,
        domain: auth0domain,
        ancestorId: props.ancestorId ? Number(props.ancestorId) : undefined,
        parentId: props.parentId ? Number(props.parentId) : undefined,
      }),
    });

    const json = (await response.json()) as ResponseBody<number>;

    if (!response.ok || json.message) {
      throw new Error('Failed to post comment: ' + (json.message || 'Unknown'));
    }

    if (props.ancestorId || props.parentId) {
      store.addComment(json.data as number, comment.value, auth0.user.value, Number(props.ancestorId), Number(props.parentId));
    } else {
      store.addComment(json.data as number, comment.value, auth0.user.value);
    }
    comment.value = '';
  } catch (e) {
    message.value = (e as Error).message || String(e);
  }

  isSending.value = false;
  emit('close');
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
function onCancel(): void {
  emit('close');
}

onMounted(() => {
  textarea.value?.focus();
});
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
      ref="textarea"
      class="focus:outline-none"
      rows="3"
      placeholder="Write a comment..."
      required
      @keydown.enter="onKeydown"
      @keydown.esc="onCancel"
      v-model="comment"
    )
    .p-2.rounded-b-lg.bg-base-300.flex.items-center
      .text-xs(
        v-if="!noVersion"
        class="text-neutral-400/40"
      ) v{{version}}
      .ac-alert.ac-alert-error.mx-4.py-1(v-if="message") {{message}}
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
