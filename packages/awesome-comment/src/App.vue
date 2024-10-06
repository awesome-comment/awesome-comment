<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import CommentForm from './components/comment-form.vue';
import CommentSection from './components/comment-section.vue';
import useStore from './store';
import useAuthStore from './store/auth.ts';

const store = useStore();
const { t } = useI18n();
const authStore = useAuthStore();
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
</script>

<template lang="pug">
.awesome-comment
  .ac-alert.ac-alert-error.mb-4(v-if="store.message")
    p {{ store.message }}

  header.flex.justify-between.items-center.py-2
    h2.text-lg.font-bold.text-base-content.my-0 {{t('discussion')}} ({{ total }})
    span.ac-loading.ac-loading-spinner(v-if="authStore.isLoading")
    .ac-dropdown.ac-dropdown-end(v-else)
      template(v-if="authStore.isAuthenticated && authStore.user")
        label.ac-avatar.flex(v-if="authStore.user.picture" tabindex="0")
          .w-6.h-6.rounded-full
            img.w-full.h-full.block(
              :alt="authStore.user.name || authStore.user.email"
              :src="authStore.user.picture"
            )
        label.ac-btn.ac-btn-ghost(v-else tabindex="0") {{authStore.user.email}}
        ul.ac-dropdown-content.z-10.ac-menu.p-2.shadow.bg-base-100.rounded-box.w-52(tabindex="0")
          li.border-b.border-neutral.pb-2.mb-2.pointer-events-none(v-if="authStore.user.picture")
            span.text-base-content {{authStore.user.email}}
          li
            button.border-0.bg-base-100(
              type="button"
              :disabled="authStore.isLoading"
              @click="doLogout"
            ) {{t('logout')}}
      button.ac-btn.ac-btn-secondary.ac-btn-xs(
        v-else
        type="button"
        :disabled="authStore.isLoading"
        @click="doLogin"
      ) {{t('login')}}

  comment-form
  comment-section
</template>
