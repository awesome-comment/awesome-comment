<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { sleep } from '@awesome-comment/core/utils';
import type { AcConfig } from '@awesome-comment/core/types';
import { useConfigStore } from '~/store';

const auth0 = process.client ? useAuth0() : undefined;
const store = useConfigStore();

const isLoading = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const isSaved = ref<boolean>(false);
const message = ref<string>('');
const config = computed<AcConfig>({
  get(): AcConfig {
    return store.config;
  },
  set(value: Partial<AcConfig>) {
    store.setConfig(value);
  },
});
const adminEmails = computed<string>({
  get(): string {
    return store.config.adminEmails.join('\n');
  },
  set(value: string) {
    store.setConfig({ adminEmails: value.split('\n') });
  },
});

async function doSave(event: Event): Promise<void> {
  if (
    !auth0
    || isSaving.value
    || (event.target as HTMLFormElement).matches(':invalid'))
  {
    return;
  }
  if (auth0 && !auth0.isAuthenticated.value) {
    message.value = 'Sorry, you must login first.';
    return;
  }

  isSaving.value = true;
  message.value = '';
  try {
    const token = await auth0.getAccessTokenSilently();
    await $fetch('/api/admin/config', {
      method: 'POST',
      body: {
        ...store.config,
        adminEmails: Array.from(
          new Set(
            store.config.adminEmails
              .map(item => item.trim())
              .filter(Boolean)
          )
        ),
      },
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

onMounted(async () => {
  if (!auth0?.isAuthenticated.value) {
    message.value = 'Sorry, you must login first.';
    return;
  }

  isLoading.value = true;
  await store.initStore();
  isLoading.value = false;
});

useHead({
  title: 'Admin Settings',
  description: 'Admin Settings',
});
definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  name: 'admin-settings',
});
</script>

<template lang="pug">
header.flex.items-center.pb-4.mb-4.border-b
  h1.text-xl.font-bold Settings
  span.loading.loading-spinner.ms-4(v-if="isLoading")
  button.btn.ms-auto(
    form="config-form"
    :class="isSaved ? 'btn-success' : 'btn-primary'"
    :disabled="isSaving || !auth0?.isAuthenticated"
  )
    span.loading.loading-spinner(v-if="isSaving")
    i.bi.bi-check-lg(v-else)
    | Save

.alert.alert-error.mb-4(v-if="message")
  p
    i.bi.bi-exclamation-triangle-fill.me-2
    | {{ message }}

form#config-form(
  class="w-1/2"
  @submit.prevent="doSave"
)
  .form-control
    label.label(for="admin-emails")
      span.label-text Admin Email
    textarea#admin-emails.textarea.textarea-bordered(
      required
      rows="4"
      v-model="adminEmails"
    )
    label.label(for="admin-emails")
      span.label-text-alt Please use line breaks to split emails.
  .form-control
    label.label
      span.label-text Users with 2 approved comments do not need to be moderated for new comments.
    .flex.justify-start
      label.label.cursor-pointer
        span.label-text(
          :class="!config.autoApprove.enabled ? '' : 'opacity-50'"
        ) OFF
        input.toggle.mx-2(
          type="checkbox"
          :class="config.autoApprove.enabled ? 'toggle-primary' : ''"
          v-model="config.autoApprove.enabled"
        )
        span.label-text(
          :class="config.autoApprove.enabled ? 'text-primary font-bold' : ''"
        ) ON
      input.input.input-bordered.font-mono.ms-4(
        v-if="config.autoApprove.enabled"
        placeholder="Include URLs, default all"
        v-model="config.autoApprove.include"
      )
      input.input.input-bordered.font-mono.ms-4(
        v-if="config.autoApprove.enabled"
        placeholder="Exclude URLs"
        v-model="config.autoApprove.exclude"
      )
</template>

<script lang="ts">
export default {
  name: 'AdminSettingsPage',
}
</script>
