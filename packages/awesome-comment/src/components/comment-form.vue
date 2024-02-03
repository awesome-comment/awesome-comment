<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { useI18n } from 'vue-i18n';
import type { CommentStatus } from '@awesome-comment/core/data';
import type { ResponseBody } from '@awesome-comment/core/types';
import { withCommandModifier } from '@awesome-comment/core/utils';
import useStore from '../store';

type PostResponse = {
  id: number,
  status: CommentStatus,
};

type Props = {
  noVersion?: boolean;
  parentId?: number;
  ancestorId?: number;
}
const props = defineProps<Props>();
type Emits = {
  (event: 'close'): (event: Event) => boolean | void;
}
const emit = defineEmits<Emits>();

const auth0 = useAuth0();
const store = useStore();
const { t } = useI18n();
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

    const json = (await response.json()) as ResponseBody<PostResponse>;

    if (!response.ok || json.message) {
      message.value = 'Failed to post comment: ' + (json.message || 'Unknown');
      isSending.value = false;
      return;
    }

    const { id, status } = json.data as PostResponse;
    if (props.ancestorId || props.parentId) {
      store.addComment(
        id,
        comment.value,
        auth0.user.value,
        props.ancestorId,
        props.parentId,
        status,
      );
    } else {
      store.addComment(id, comment.value, auth0.user.value, status);
    }
    comment.value = '';
    emit('close');
  } catch (e) {
    message.value = (e as Error).message || String(e);
  }

  isSending.value = false;
}
function doLogin(): void {
  auth0.loginWithPopup();
}
function onKeydown(event: KeyboardEvent): void {
  if (withCommandModifier(event, 'enter')) {
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
    ) {{t('your_comment')}}
    textarea#ac-comment.ac-textarea.ac-textarea-bordered.bg-base-200.rounded-b-none(
      ref="textarea"
      class="focus:outline-none"
      rows="3"
      :placeholder="t('placeholder')"
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
        | {{parentId ? t('post_reply') : t('post_comment')}}
</template>

<script lang="ts">
export default {
  name: 'CommentForm',
}
</script>
