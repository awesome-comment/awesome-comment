<script setup lang="ts">
import { computed } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import CommentForm from './components/comment-form.vue';
import CommentSection from './components/comment-section.vue';
import useStore from './store';

const store = useStore();
const {
  isAuthenticated,
  isLoading,
  user,
  loginWithPopup,
  logout,
} = useAuth0();
const total = computed<number | string>(() => {
  const total = (store.total > 20 || (store.total === 20 && store.hasMore))
    ? store.total + '+' : store.total;
  if (store.total === 0) return '0';

  const event = new CustomEvent('AwesomeComment:total', {
    bubbles: true,
    cancelable: true,
    detail: total,
  });
  document.body.dispatchEvent(event);
  return total;
});

function doLogin(): void {
  loginWithPopup();
}
function doLogout(): void {
  logout({
    openUrl: false,
  });
}
</script>

<template lang="pug">
.awesome-comment
  .ac-alert.ac-alert-error.mb-4(v-if="store.message")
    p {{ store.message }}

  header.flex.justify-between.items-center.py-2
    h2.text-lg.font-bold.text-base-content.my-0 Discussion ({{ total }})
    span.ac-loading.ac-loading-spinner(v-if="isLoading")
    .ac-dropdown.ac-dropdown-end(v-else)
      template(v-if="isAuthenticated && user")
        label.ac-avatar.flex(v-if="user.picture" tabindex="0")
          .w-6.h-6.rounded-full
            img.w-full.h-full.block(
              :alt="user.name || user.email"
              :src="user.picture"
            )
        label.ac-btn.ac-btn-ghost(v-else tabindex="0") {{user.email}}
        ul.ac-dropdown-content.z-10.ac-menu.p-2.shadow.bg-base-100.rounded-box.w-52(tabindex="0")
          li.border-b.border-neutral.pb-2.mb-2.pointer-events-none(v-if="user.picture")
            span.text-base-content {{user.email}}
          li
            button.border-0.bg-base-100(
              type="button"
              :disabled="isLoading"
              @click="doLogout"
            ) Logout
      button.ac-btn.ac-btn-secondary.ac-btn-xs(
        v-else
        type="button"
        :disabled="isLoading"
        @click="doLogin"
      ) Login

  comment-form
  comment-section
</template>
