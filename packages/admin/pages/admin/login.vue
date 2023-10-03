<script lang="ts" setup>
import { useAuth0, User } from '@auth0/auth0-vue';

const auth0 = process.client ? useAuth0() : undefined;

const isAuthenticated = computed<boolean>(() => {
  return !!auth0?.isAuthenticated.value;
});
const isLoading = computed<boolean>(() => {
  return !!auth0?.isLoading.value;
});
const user = computed<User | null>(() => {
  return auth0?.user.value || null;
})

function doLogin() {
  auth0?.checkSession();
  if (!isAuthenticated.value) {
    auth0?.loginWithPopup();
  }
}

async function doLogout(): Promise<void> {
  await auth0?.logout();
}
</script>

<template lang="pug">
h1.text-xl.font-bold.mb-4 Login
template(v-if="isAuthenticated")
  p.mb-4 Welcome, {{user?.name || user?.email}}
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
