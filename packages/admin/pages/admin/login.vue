<script lang="ts" setup>
import { useAdminAuth } from '../../composables/use-admin-auth';

const adminAuth = useAdminAuth();
const { isAuthenticated, isLoading } = adminAuth;

async function doLogin(): Promise<void> {
  await adminAuth.login();
}

async function doLogout(): Promise<void> {
  await adminAuth.logout();
}

useHead({
  title: 'Admin Login',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});
definePageMeta({
  layout: 'admin',
  name: 'Admin Login',
});
</script>

<template lang="pug">
h1.text-xl.font-bold.mb-4 Login
template(v-if="isAuthenticated")
  p.mb-4 已登录
  button.btn.btn-info(
    type="button"
    :disabled="isLoading"
    @click="doLogout"
  )
    span.loading.loading-spinner(v-if="isLoading")
    | Logout
button.btn.btn-primary.btn-lg(
  v-else
  type="button"
  :disabled="isLoading"
  @click="doLogin"
)
  span.loading.loading-spinner(v-if="isLoading")
  | Login

</template>

<script lang="ts">
export default {
  name: 'AdminLoginPage',
}
</script>
