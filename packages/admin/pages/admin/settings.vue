<script setup lang="ts">
import { sleep } from '@awesome-comment/core/utils';
import type { AcConfig } from '@awesome-comment/core/types';
import useConfigStore from '../../store';
import { useAdminAuth } from '../../composables/use-admin-auth';

const adminAuth = useAdminAuth();
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
  if (isSaving.value || (event.target as HTMLFormElement).matches(':invalid')) {
    return;
  }
  if (!adminAuth.isAuthenticated.value) {
    message.value = 'Sorry, you must login first.';
    return;
  }

  isSaving.value = true;
  message.value = '';
  try {
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
        ...(await adminAuth.buildHeaders({
          'Content-Type': 'application/json',
        })),
      }
    });
    isSaved.value = true;
    await sleep(1500);
    isSaved.value = false;
  } catch (e) {
    message.value = (e as Error).message || String(e);
  }
  isSaving.value = false;
}

onMounted(async () => {
  if (!adminAuth.isAuthenticated.value) {
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
      class="loading loading-spinner size-4 ms-4"
    />
    <button
      class="btn btn-sm ms-auto"
      :class="isSaved ? 'btn-success' : 'btn-primary'"
      :disabled="isSaving || !adminAuth.isAuthenticated"
      form="config-form"
    >
      <span
        v-if="isSaving"
        class="loading loading-spinner size-4"
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
    class="w-1/2 space-y-4"
    @submit.prevent="doSave"
  >
    <div class="form-control">
      <label
        class="block mb-1"
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
      <p
        class="text-xs"
      >
        Please use line breaks to split emails.
      </p>
    </div>
    <div class="form-control">
      <label
        class="block mb-1"
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
    <div class="form-control">
      <label
        class="block mb-1"
        for="admin-display-avatar"
      >
        <span class="label-text">Admin Display Avatar</span>
      </label>
      <input
        id="admin-display-avatar"
        v-model="adminDisplayAvatar"
        class="input input-bordered"
        type="url"
      >
    </div>
    <div class="form-control">
      <label
        class="block mb-1"
        for="shortcut-emojis"
      >
        Preset content
      </label>
      <textarea
        id="shortcut-emojis"
        v-model="shortcutEmojis"
        class="textarea textarea-bordered"
        rows="4"
      />
    </div>
    <div class="form-control">
      <div class="block pb-2 mb-3 border-b">
        Auto approve
      </div>
      <div class="grid grid-cols-[1fr_6rem] items-start gap-2">
        <div class="text-sm">
          Users with 2 approved comments do not need to be moderated for new comments.
        </div>
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
    </div>
  </form>
</template>

<script lang="ts">
export default {
  name: 'AdminSettingsPage',
}
</script>
