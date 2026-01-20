<script setup lang="ts">
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CommentStatus } from '@awesome-comment/core/data';
import type { ResponseBody } from '@awesome-comment/core/types';
import type { User } from '@auth0/auth0-vue';
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
const turnstileSiteKey = inject<string | undefined>('TurnstileSiteKey');
const version = __VERSION__;
const textarea = ref<HTMLTextAreaElement>();
const turnstileContainer = ref<HTMLDivElement>();

const isSending = ref<boolean>(false);
const comment = ref<string>(props.content || '');
const message = ref<string>('');
const needAuth = ref<boolean>(false);
const turnstileToken = ref<string>('');
const turnstileWidgetId = ref<string>('');
const isAnonymous = computed(() => !authStore.isAuthenticated);

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Turnstile 仅支持浏览器环境'));
  if (window.turnstile) return Promise.resolve();
  if (turnstileScriptPromise) return turnstileScriptPromise;
  const src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    const script = existingScript || document.createElement('script');

    function handleLoad() {
      resolve();
    }
    function handleError() {
      reject(new Error('Failed to load Turnstile script'));
    }

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    if (!existingScript) {
      script.src = src;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
  turnstileScriptPromise.catch(() => {
    turnstileScriptPromise = null;
  });
  return turnstileScriptPromise;
}

async function renderTurnstile(): Promise<void> {
  if (!turnstileSiteKey || !turnstileContainer.value) return;
  await loadTurnstileScript();
  if (!window.turnstile) {
    message.value = 'Turnstile initialization failed';
    return;
  }
  if (turnstileWidgetId.value) {
    window.turnstile.reset(turnstileWidgetId.value);
    return;
  }
  turnstileWidgetId.value = window.turnstile.render(turnstileContainer.value, {
    sitekey: turnstileSiteKey,
    size: 'compact',
    callback: (token: string) => {
      turnstileToken.value = token;
      message.value = '';
    },
    'expired-callback': () => {
      turnstileToken.value = '';
    },
    'error-callback': () => {
      turnstileToken.value = '';
      message.value = 'Turnstile validation failed, please try again.';
    },
  });
}

function resetTurnstile(): void {
  if (!turnstileWidgetId.value || !window.turnstile) {
    turnstileToken.value = '';
    return;
  }
  try {
    window.turnstile.remove(turnstileWidgetId.value);
  } catch {
    window.turnstile.reset(turnstileWidgetId.value);
  }
  turnstileWidgetId.value = '';
  turnstileToken.value = '';
}

function getLocalUser(): User {
  if (authStore.user) return authStore.user as User;
  return {
    sub: 'anonymous',
    name: 'anonymous',
    nickname: 'anonymous',
    picture: '',
    email: '',
  } as User;
}

async function doSubmit(event: Event): Promise<void> {
  if (!authStore.isAuthenticated) {
    if (!turnstileSiteKey) {
      return doLogin();
    }
    needAuth.value = true;
    if (!turnstileToken.value) {
      await nextTick();
      await renderTurnstile();
      return;
    }
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
    const accessToken = authStore.isAuthenticated ? await authStore.getAccessToken() : '';
    const authEndpoint = authStore.authEndpoint;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Auth-Endpoint': authEndpoint,
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    const anonymousInfo = isAnonymous.value
      ? {
          referrer: document.referrer || '',
          language: navigator.language || '',
          languages: navigator.languages || [],
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
          platform: navigator.platform || '',
        }
      : null;
    const customData = isAnonymous.value
      ? {
          custom: window.custom_comment_data ?? null,
          anonymous: anonymousInfo,
        }
      : window.custom_comment_data;
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({
        comment: commentContent,
        postId: store.postId,
        domain: auth0domain,
        ancestorId: props.ancestorId ? Number(props.ancestorId) : undefined,
        parentId: props.parentId ? Number(props.parentId) : undefined,
        status: props.status,
        window: `${window.innerWidth}x${window.innerHeight} / ${(screen.width, screen.height)}`,
        customData,
        extraData: `${window.BM_LEVEL}:${window.BM_VALUE}`,
        turnstileToken: isAnonymous.value ? turnstileToken.value : undefined,
      }),
    });

    const json = (await response.json()) as ResponseBody<PostResponse>;

    if (!response.ok || json.message) {
      message.value = 'Failed to post comment: ' + (json.message || 'Unknown');
      isSending.value = false;
      return;
    }

    const { id, status } = json.data as PostResponse;
    const localUser = getLocalUser();
    if (props.ancestorId || props.parentId) {
      store.addComment(id, commentContent, localUser, status, props.ancestorId, props.parentId);
    } else if (props.currentId) {
      emit('update', commentContent);
    } else {
      store.addComment(id, commentContent, localUser, status);
    }
    comment.value = '';
    emit('close');
    if (isAnonymous.value) {
      resetTurnstile();
      needAuth.value = false;
    }
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

watch(
  () => needAuth.value,
  async (value) => {
    if (!value || authStore.isAuthenticated) return;
    await nextTick();
    await renderTurnstile();
  },
);

watch(
  () => authStore.isAuthenticated,
  (value) => {
    if (value) {
      needAuth.value = false;
      resetTurnstile();
    }
  },
);
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
      <div class="p-2 rounded-b-lg bg-base-300 flex items-center relative">
        <div
          v-if="!noVersion"
          class="text-xs text-neutral-400/40"
          :class="{'me-auto': !message}"
        >
          v{{ version }}
        </div>
        <div
          v-if="message"
          class="ac-alert ac-alert-error ms-4 me-auto py-1"
        >
          {{ message }}
        </div>
        <template
          v-if="needAuth && !authStore.isAuthenticated"
        >
          <button
            v-if="!authStore.isAwesomeAuth"
            class="ac-btn ac-btn-secondary ac-btn-xs mx-4"
            type="button"
            @click="doLogin"
          >
            {{ t('login') }}
          </button>
          <div
            v-if="turnstileSiteKey"
            ref="turnstileContainer"
            class="absolute right-2 top-10"
          />
        </template>
        <button
          :disabled="isSending || (needAuth && !authStore.isAuthenticated && !turnstileToken)"
          class="ac-btn ac-btn-primary ac-btn-sm"
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
