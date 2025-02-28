<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { sleep } from '@awesome-comment/core/utils';
import type { AcConfig } from '@awesome-comment/core/types';
import useConfigStore from '~/store';

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
const adminDisplayName = computed<string>({
  get(): string {
    return store.config.adminDisplayName;
  },
  set(value: string) {
    store.setConfig({ adminDisplayName: value });
  },
});
const adminDisplayAvatar = computed<string>({
  get(): string {
    return store.config.adminDisplayAvatar;
  },
  set(value: string) {
    store.setConfig({ adminDisplayAvatar: value });
  },
});
const shortcutEmojis = computed<string>({
  get(): string {
    return store.config.shortcutEmojis.join('\n');
  },
  set(value: string) {
    store.setConfig({ shortcutEmojis: value.split('\n') });
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

<template>
  <header class="flex items-center pb-4 mb-4 border-b">
    <h1 class="text-xl font-bold">
      Settings
    </h1>
    <span
      v-if="isLoading"
      class="loading loading-spinner ms-4"
    />
    <button
      class="btn btn-sm ms-auto"
      :class="isSaved ? 'btn-success' : 'btn-primary'"
      :disabled="isSaving || !auth0?.isAuthenticated"
      form="config-form"
    >
      <span
        v-if="isSaving"
        class="loading loading-spinner"
      /><i
        v-else
        class="bi bi-check-lg"
      />Save
    </button>
  </header>
  <div
    v-if="message"
    class="alert alert-error mb-4"
  >
    <p>
      <i class="bi bi-exclamation-triangle-fill me-2" />{{ message }}
    </p>
  </div>
  <form
    id="config-form"
    class="w-1/2"
    @submit.prevent="doSave"
  >
    <div class="form-control">
      <label
        class="label"
        for="admin-emails"
      >
        <span class="label-text">Admin Email</span>
      </label>
      <textarea
        id="admin-emails"
        v-model="adminEmails"
        class="textarea textarea-bordered"
        required="required"
        rows="4"
      />
      <label
        class="label"
        for="admin-emails"
      >
        <span class="label-text-alt">Please use line breaks to split emails.</span>
      </label>
    </div>
    <div class="form-control mb-2">
      <label
        class="label"
        for="admin-display-name"
      >
        <span class="label-text">Admin Display Name</span>
      </label>
      <input
        id="admin-display-name"
        v-model="adminDisplayName"
        class="input input-bordered"
        type="text"
      >
    </div>
    <div class="form-control mb-6">
      <label
        class="label"
        for="admin-display-avatar"
      >
        <span class="label-text">Admin Display Name</span>
      </label>
      <input
        id="admin-display-avatar"
        v-model="adminDisplayAvatar"
        class="input input-bordered"
        type="url"
      >
    </div>
    <label
      class="block mb-2"
      for="shortcut-emojis"
    >
      Preset content
    </label>
    <div class="form-control mb-6">
      <textarea
        class="textarea textarea-bordered"
        id="shortcut-emojis"
        rows="4"
        v-model="shortcutEmojis"
      />
    </div>
    <h3 class="pb-2 mb-2 border-b">
      Auto approve
    </h3>
    <div class="form-control">
      <label
        class="label"
        for="auto-approve"
      >
        <span class="label-text">Users with 2 approved comments do not need to be moderated for new comments.</span>
      </label>
      <div class="flex justify-start">
        <label class="label cursor-pointer">
          <span
            :class="!config.autoApprove.enabled ? '' : 'opacity-50'"
            class="label-text"
          >OFF</span>
          <input
            id="auto-approve"
            v-model="config.autoApprove.enabled"
            :class="config.autoApprove.enabled ? 'toggle-primary' : ''"
            class="toggle mx-2"
            type="checkbox"
          >
          <span
            :class="config.autoApprove.enabled ? 'text-primary font-bold' : ''"
            class="label-text"
          >ON</span>
        </label>
        <input
          v-if="config.autoApprove.enabled"
          v-model="config.autoApprove.include"
          class="input input-bordered font-mono ms-4"
          placeholder="Include URLs, default all"
        >
        <input
          v-if="config.autoApprove.enabled"
          v-model="config.autoApprove.exclude"
          class="input input-bordered font-mono ms-4"
          placeholder="Exclude URLs"
        >
      </div>
    </div>
  </form>
</template>

<script lang="ts">
export default {
  name: 'AdminSettingsPage',
}
</script>
