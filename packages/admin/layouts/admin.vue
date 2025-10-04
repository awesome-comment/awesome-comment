<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import useConfigStore from '~/store';
import usePromptStore from '~/store/prompt';

const auth0 = useAuth0();
const configStore = useConfigStore();
const promptStore = usePromptStore();

const {
  isAuthenticated
} = auth0;

watch(isAuthenticated, (value) => {
  if (value) {
    configStore.initStore();
    configStore.initMyConfig();
    promptStore.refreshPrompts();
  }
});

onMounted(() => {
  if (!auth0.isAuthenticated.value) return;

  configStore.initStore();
  configStore.initMyConfig();
  promptStore.refreshPrompts();
});
</script>

<template>
  <layouts-admin-header />
  <nuxt-page />
</template>
