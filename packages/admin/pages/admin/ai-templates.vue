<script setup lang="ts">
import { sleep } from '@awesome-comment/core/utils';
import usePromptStore from '../../store/prompt';
import useConfigStore from '../../store';
import { useAdminAuth } from '../../composables/use-admin-auth';

const store = useConfigStore();
const promptStore = usePromptStore();
const adminAuth = useAdminAuth();

const isSaving = ref<boolean>(false);
const isSaved = ref<boolean>(false);
const fixed = ref<number[]>([]);
const shortcuts = ref<Record<string, string>>({});
const autoSubmit = ref<number[]>([]);
const errors = ref<Record<string, string>>({});
const { data, refresh, status } = useAsyncData(
  'prompts',
  async function () {
    if (!adminAuth.isAuthenticated.value) return [];
    await promptStore.refreshPrompts();
    await store.initMyConfig();
    fixed.value = store.myConfig.fixedAiTemplates || [];
    autoSubmit.value = store.myConfig.autoSubmit || [];
    shortcuts.value = Object.entries(store.myConfig.aiTemplateShortcuts)
      .reduce((acc, [key, value]) => {
        acc[ value ] = key;
        return acc;
      }, {} as Record<string, string>);
    return promptStore.prompts;
  },
  {
    default() {
      return [];
    },
  },
);
const sortedPrompts = computed(() => {
  return Object.values(data.value).sort((a, b) => a.title.localeCompare(b.title));
});

async function doSave(): Promise<void> {
  const aiTemplateShortcuts = {};
  errors.value = {};
  for (const [key, value] of Object.entries(shortcuts.value)) {
    if (value in aiTemplateShortcuts) {
      errors.value[ key ] = 'Duplicate shortcut';
      return;
    }
    aiTemplateShortcuts[ value ] = key;
  }
  isSaving.value = true;
  const toUpdate = {
    fixedAiTemplates: fixed.value,
    aiTemplateShortcuts,
    autoSubmit: autoSubmit.value,
  }
  await store.updateMyConfig(toUpdate);
  isSaving.value = false;
  isSaved.value = true;
  await sleep(1500);
  isSaved.value = false;
}
</script>

<template>
  <header class="sm:flex items-center mb-4 gap-4">
    <div class="flex items-center gap-4 mb-2 sm:mb-0">
      <h1 class="text-2xl font-bold">
        AI Prompts Template Management
      </h1>
      <span
        v-if="status === 'pending'"
        class="loading loading-spinner"
      />
    </div>
    <div class="flex items-center ms-auto gap-4">
      <NuxtLink
        to="/admin/prompts/new"
        class="btn btn-primary btn-sm text-white"
      >
        <i class="bi bi-plus-lg" />
        New Prompt
      </NuxtLink>
      <button
        class="btn btn-success btn-sm text-white"
        type="button"
        :disabled="status === 'pending'"
        @click="refresh"
      >
        <i class="bi bi-arrow-clockwise" />
        Refresh
      </button>
      <button
        :class="isSaved ? 'btn-success' : 'btn-primary'"
        :disabled="isSaving"
        type="button"
        class="btn btn-sm text-white"
        @click="doSave"
      >
        <span
          v-if="isSaving"
          class="loading loading-spinner"
        />
        <i
          v-else
          class="bi bi-check-lg"
        />
        {{ isSaved ? 'Saved' : 'Save' }}
      </button>
    </div>
  </header>
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Template Title</th>
        <th>Fix to Reply Modal</th>
        <th>Shortcuts</th>
        <th>Auto submit</th>
        <th />
      </tr>
    </thead>
    <tbody v-if="promptStore.isLoading">
      <tr>
        <td colspan="4">
          <div class="h-32 flex justify-center items-center gap-2">
            <span class="loading loading-spinner" />
            Loading...
          </div>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr
        v-for="(prompt, index) in sortedPrompts"
        :key="index"
      >
        <td>{{ prompt.id }}</td>
        <td>
          <NuxtLink
            :to="`/admin/prompts/${prompt.id}`"
            class="link link-primary"
          >
            {{ prompt.title }}
          </NuxtLink>
        </td>
        <td>
          <input
            v-model="fixed"
            type="checkbox"
            class="checkbox"
            name="is-fix"
            :value="prompt.id"
          >
        </td>
        <td>
          <input
            v-model.lazy="shortcuts[prompt.id]"
            class="input input-bordered input-sm block"
            placeholder="Shortcut"
          >
          <div
            v-if="errors[prompt.id]"
            class="text-error text-xs ps-2 mt-1"
          >
            {{ errors[prompt.id] }}
          </div>
        </td>
        <td>
          <input
            v-model="autoSubmit"
            type="checkbox"
            class="checkbox"
            name="auto-submit"
            :value="prompt.id"
          >
        </td>
        <td>
          <ui-modal
            button-class="btn btn-info btn-sm text-white"
            button-label="View template"
            title="View template"
          >
            <div class="bg-base-200 p-4 max-h-80 overflow-auto">
              <p class="whitespace-pre-wrap font-mono">
                {{ prompt.content }}
              </p>
            </div>
          </ui-modal>
        </td>
      </tr>
    </tbody>
  </table>
</template>
