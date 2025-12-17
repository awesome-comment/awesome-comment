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

const inited = ref<boolean>(false);

async function initData(): Promise<void> {
  if (inited.value || !auth0.isAuthenticated.value) return;
  inited.value = true;
  await Promise.all([
    configStore.initStore(),
    configStore.initMyConfig(),
    promptStore.refreshPrompts(),
  ]);
}

watch(isAuthenticated, (value) => {
  if (value) initData();
}, { immediate: true });

onMounted(() => {
  initData();
});
</script>

<template>
  <layouts-admin-header />
  <nuxt-page />
</template>
