<script setup lang="ts">
import { useAuth0 } from "@auth0/auth0-vue";

const auth0 = useAuth0();

function doLogin(): void {
  auth0.loginWithRedirect();
}
</script>

<template lang="pug">
button.btn(
  type="button"
  @click="doLogin"
) Login
</template>
