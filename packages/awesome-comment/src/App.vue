<script setup lang="ts">
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

function doLogin(): void {
  loginWithPopup();
}
function doLogout(): void {
  logout();
}
</script>

<template lang="pug">
main
  .alert.alert-error.mb-4(v-if="store.message")
    p {{ store.message }}

  header.flex.justify-between.items-center.py-2
    h2.text-lg.font-bold.text-neutral-content Discussion ({{store.total}})
    .dropdown.dropdown-end(v-if="isAuthenticated")
      template(v-if="user")
        label.avatar.flex(v-if="user.picture" tabindex="0")
          .w-6.h-6.rounded-full
            img.w-full.h-full.block(
              :alt="user.name || user.email"
              :src="user.picture"
            )
        label.btn.btn-ghost(v-else tabindex="0") {{user.email}}
        ul.dropdown-content.z-10.menu.p-2.shadow.bg-base-100.rounded-box.w-52(tabindex="0")
          li.border-b.border-neutral.pb-2.mb-2.pointer-events-none(v-if="user.picture")
            span {{user.email}}
          li
            button(
              type="button"
              :disabled="isLoading"
              @click="doLogout"
            ) Logout
      button.btn.btn-secondary.btn-xs(
        v-else
        type="button"
        :disabled="isLoading"
        @click="doLogin"
      ) Login
    span.loading.loading-spinner(v-else)

  comment-form
  comment-section
</template>
