<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import CommentForm from './components/comment-form.vue';
import CommentSection from './components/comment-section.vue';
import useStore from './store';
import useAuthStore from './store/auth.ts';

const store = useStore();
const { t } = useI18n();
const authStore = useAuthStore();
const googleButton = ref<HTMLDivElement>();
const total = computed<number | string>(() => {
  const total = store.hasMore ? store.total + '+' : store.total;
  if (store.total === 0) return '0';

  const event = new CustomEvent('AwesomeComment:total', {
    bubbles: true,
    cancelable: true,
    detail: store.total,
  });
  document.body.dispatchEvent(event);
  return total;
});

function doLogin(): void {
  authStore.login();
}
function doLogout(): void {
  authStore.logout({
    openUrl: false,
  });
}

async function renderGoogleButton(): Promise<void> {
  if (!authStore.isAwesomeAuth || authStore.isAuthenticated) return;
  await nextTick();
  const target = googleButton.value;
  if (!target) return;

  target.innerHTML = '';
  const isDarkMode = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  await authStore.renderGoogleButton(target, {
    theme: isDarkMode ? 'filled_black' : 'outline',
    size: 'medium',
    text: 'signin_with',
    shape: 'pill',
  });
}

onMounted(() => {
  renderGoogleButton();
});

watch(
  () => authStore.isAuthenticated,
  (value) => {
    if (!value) {
      renderGoogleButton();
    }
  },
);
</script>

<template>
  <div class="awesome-comment">
    <div
      v-if="store.message"
      class="ac-alert ac-alert-error mb-4"
    >
      <p>{{ store.message }}</p>
    </div>
    <header class="flex justify-between items-center py-2">
      <h2 class="text-lg font-bold text-base-content my-0">
        {{ t('discussion') }} ({{ total }})
      </h2>
      <span
        v-if="authStore.isLoading"
        class="ac-loading ac-loading-spinner"
      />
      <div
        v-else-if="authStore.isAuthenticated && authStore.user"
        class="ac-dropdown ac-dropdown-end"
      >
        <label
          v-if="authStore.user.picture"
          class="ac-avatar flex"
          tabindex="0"
        >
          <span class="block w-6 h-6 rounded-full">
            <img
              :alt="authStore.user.name || authStore.user.email"
              :src="authStore.user.picture"
              class="w-full h-full block"
            >
          </span>
        </label>
        <label
          v-else
          class="ac-btn ac-btn-ghost"
          tabindex="0"
        >{{ authStore.user.email }}</label>
        <ul
          class="ac-dropdown-content z-10 ac-menu p-2 shadow bg-base-100 rounded-box w-52"
          tabindex="0"
        >
          <li
            v-if="authStore.user.picture"
            class="border-b border-neutral pb-2 mb-2 pointer-events-none"
          >
            <span class="text-base-content">{{ authStore.user.email }}</span>
          </li>
          <li>
            <button
              :disabled="authStore.isLoading"
              class="border-0 bg-base-100"
              type="button"
              @click="doLogout"
            >
              {{ t('logout') }}
            </button>
          </li>
        </ul>
      </div>
      <template v-else>
        <div
          v-if="authStore.isAwesomeAuth"
          ref="googleButton"
          class="g-id-signin"
        />
        <button
          v-else
          :disabled="authStore.isLoading"
          class="ac-btn ac-btn-secondary ac-btn-xs"
          type="button"
          @click="doLogin"
        >
          {{ t('login') }}
        </button>
      </template>
    </header>
    <comment-form />
    <comment-section />
  </div>
</template>
