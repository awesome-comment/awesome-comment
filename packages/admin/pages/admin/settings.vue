<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { sleep } from '@awesome-comment/core/utils';
import { useConfigStore } from '~/store';

const auth0 = process.client ? useAuth0() : undefined;
const store = useConfigStore();

const isSaving = ref<boolean>(false);
const isSaved = ref<boolean>(false);
const message = ref<string>('');
const adminEmails = computed<string>({
  get(): string {
    return store.config.adminEmails.join('\n');
  },
  set(value: string) {
    const emails = value.split('\n')
      .map(item => item.trim())
      .filter(Boolean);
    store.setConfig({ adminEmails: Array.from(new Set(emails)) });
  },
});

definePageMeta({
  middleware: ['auth'],
});

async function doSave(event: Event): Promise<void> {
  if (
    !auth0
    || isSaving.value
    || (event.target as HTMLFormElement).matches(':invalid'))
  {
    return;
  }

  isSaving.value = true;
  message.value = '';
  try {
    const token = await auth0.getAccessTokenSilently();
    await $fetch('/api/admin/config', {
      method: 'POST',
      body: store.config,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    });
    isSaved.value = true;
    await sleep(1500);
    isSaved.value = false;
  } catch (e) {
    message.value = e.message;
  }
  isSaving.value = false;
}

onMounted(() => {
  store.initStore();
});
</script>

<template lang="pug">
header.flex.items-center.justify-between.pb-4.mb-4.border-b
  h1.text-xl.font-bold Settings
  button.btn(
    form="config-form"
    :class="isSaved ? 'btn-success' : 'btn-primary'"
    :disabled="isSaving"
  )
    span.loading.loading-spinner(v-if="isSaving")
    i.bi.bi-check-lg(v-else)
    | Save
form#config-form(
  class="w-1/2"
  @submit.prevent="doSave"
)
  .form-control
    label.label
      span.label-text Admin Email
    textarea.textarea.textarea-bordered(
      required
      rows="4"
      v-model="adminEmails"
    )
    label.label
      span.label-text-alt Please use line breaks to split emails.
</template>

<script lang="ts">
export default {
  name: 'AdminSettingsPage',
}
</script>
