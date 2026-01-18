<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CommentStatus } from '@awesome-comment/core/data';
import type { ResponseBody } from '@awesome-comment/core/types';
import { withCommandModifier } from '@awesome-comment/core/utils';
import { validateCommentContent } from '@awesome-comment/core/utils/validation';
import useStore from '../store';
import useAuthStore from '../store/auth.ts';

type PostResponse = {
  id: number;
  status: CommentStatus;
};

type Props = {
  noVersion?: boolean;
  currentId?: number;
  parentId?: number;
  ancestorId?: number;
  content?: string;
  status?: CommentStatus;
};
const props = defineProps<Props>();
type Emits = {
  (event: 'close'): void;
  (event: 'update', value: string): void;
};
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
  if (!validateCommentContent(commentContent).valid) {
    message.value =
      'We encourage meaningful contributions to foster a positive community. Thank you for your understanding!';
    return;
  }

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
        window: `${window.innerWidth}x${window.innerHeight} / ${(screen.width, screen.height)}`,
        customData: window.custom_comment_data,
        extraData: `${window.BM_LEVEL}:${window.BM_VALUE}`,
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
      store.addComment(id, commentContent, authStore.user, status, props.ancestorId, props.parentId);
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

<template>
  <form
    class="mb-6"
    @submit.prevent="doSubmit"
  >
    <div class="ac-form-control bg-base-200 rounded-lg">
      <label
        class="sr-only"
        for="ac-comment"
      >{{ t('your_comment') }}</label>
      <textarea
        id="ac-comment"
        ref="textarea"
        v-model="comment"
        :placeholder="t('placeholder')"
        class="ac-textarea ac-textarea-bordered bg-base-200 rounded-b-none focus:outline-none"
        required
        rows="3"
        @keydown.stop
        @keyup.stop
        @keydown.enter="onKeydown"
        @keydown.esc="onCancel"
      />
      <div class="p-2 rounded-b-lg bg-base-300 flex items-center">
        <div
          v-if="!noVersion"
          class="text-xs text-neutral-400/40"
        >
          v{{ version }}
        </div>
        <div
          v-if="message"
          class="ac-alert ac-alert-error mx-4 py-1"
        >
          {{ message }}
        </div>
        <button
          :disabled="isSending"
          class="ac-btn ac-btn-primary ac-btn-sm ms-auto"
        >
          <span
            v-if="isSending"
            class="ac-loading ac-loading-spinner"
          />
          <template v-if="currentId">
            {{ t('save_editing') }}
          </template>
          <template v-else-if="parentId">
            {{ t('post_reply') }}
          </template>
          <template v-else>
            {{ t('post_comment') }}
          </template>
        </button>
      </div>
    </div>
  </form>
</template>

<script lang="ts">
export default {
  name: 'CommentForm',
}
</script>
