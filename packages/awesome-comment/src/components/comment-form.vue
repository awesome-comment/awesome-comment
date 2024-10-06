<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CommentStatus } from '@awesome-comment/core/data';
import type { ResponseBody } from '@awesome-comment/core/types';
import { withCommandModifier } from '@awesome-comment/core/utils';
import useStore from '../store';
import useAuthStore from '../store/auth.ts';

type PostResponse = {
  id: number,
  status: CommentStatus,
};

type Props = {
  noVersion?: boolean;
  currentId?: number;
  parentId?: number;
  ancestorId?: number;
  content?: string;
  status?: CommentStatus;
}
const props = defineProps<Props>();
type Emits = {
  (event: 'close'): void;
  (event: 'update', value: string): void;
}
const emit = defineEmits<Emits>();

const authStore = useAuthStore();
const store = useStore();
const { t } = useI18n();
const baseUrl = inject('ApiBaseUrl');
const auth0domain = inject('Auth0Domain');
const version = __VERSION__;
const textarea = ref<HTMLTextAreaElement>();

const isSending = ref<boolean>(false);
const comment = ref<string>(props.content || '');
const message = ref<string>('');

async function doSubmit(event: Event): Promise<void> {
  if (!authStore.user) {
    return doLogin();
  }
  if ((event.target as HTMLFormElement).matches(':invalid')) return;
  const commentContent = comment.value.trim();
  if (!commentContent) return;

  isSending.value = true;
  message.value = '';
  let url = baseUrl + '/api/comment';
  let method = 'POST';
  if (props.currentId) {
    url += '/' + props.currentId;
    method = 'PATCH';
  }
  try {
    const accessToken = await authStore.getAccessToken();
    const authEndpoint = authStore.authEndpoint;
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Auth-Endpoint': authEndpoint,
      },
      body: JSON.stringify({
        comment: commentContent,
        postId: store.postId,
        domain: auth0domain,
        ancestorId: props.ancestorId ? Number(props.ancestorId) : undefined,
        parentId: props.parentId ? Number(props.parentId) : undefined,
        status: props.status,
        window: `${window.innerWidth}x${window.innerHeight} / ${screen.width, screen.height}`,
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
        commentContent,
        authStore.user,
        status,
        props.ancestorId,
        props.parentId,
      );
    } else if (props.currentId) {
      emit('update', commentContent);
    } else {
      store.addComment(id, commentContent, authStore.user, status);
    }
    comment.value = '';
    emit('close');
  } catch (e) {
    message.value = (e as Error).message || String(e);
  }

  isSending.value = false;
}
function doLogin(): void {
  authStore.login();
}
function onKeydown(event: KeyboardEvent): void {
  if (withCommandModifier(event, 'Enter')) {
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
  .ac-form-control.bg-base-200.rounded-lg
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
      button.ac-btn.ac-btn-primary.ac-btn-sm.ms-auto(
        :disabled="isSending"
      )
        span.ac-loading.ac-loading-spinner(v-if="isSending")
        template(v-if="currentId") {{t('save_editing')}}
        template(v-else-if="parentId") {{ t('post_reply')}}
        template(v-else) {{t('post_comment')}}
</template>

<script lang="ts">
export default {
  name: 'CommentForm',
}
</script>
