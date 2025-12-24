<script setup lang="ts">
import useConfigStore from '../store';
import usePromptStore from '../store/prompt';
import { useAdminAuth } from '../composables/use-admin-auth';

const adminAuth = useAdminAuth();
const configStore = useConfigStore();
const promptStore = usePromptStore();

const {
  isAuthenticated
} = adminAuth;

const inited = ref<boolean>(false);

async function initData(): Promise<void> {
  if (inited.value || !adminAuth.isAuthenticated.value) return;
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
