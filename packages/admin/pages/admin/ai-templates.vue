<script setup lang="ts">
import { sleep } from '@antfu/utils';
import usePromptStore from '~/store/prompt';
import useConfigStore from '~/store';

const store = useConfigStore();
const promptStore = usePromptStore();

const isSaving = ref<boolean>(false);
const isSaved = ref<boolean>(false);
const fixed = ref<number[]>([]);
const shortcuts = ref<Record<string, string>>({});

const { data, status } = useAsyncData(
  'prompts',
  async function () {
    await promptStore.refreshPrompts();
    await store.initMyConfig();
    fixed.value = store.myConfig.fixedAiTemplates;
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

async function doSave(): Promise<void> {
  isSaving.value = true;
  const toUpdate = {
    fixedAiTemplates: fixed.value,
    aiTemplateShortcuts: Object.entries(shortcuts.value)
      .reduce((acc, [key, value]) => {
        acc[ value ] = key;
        return acc;
      }, {} as Record<string, string>),
  }
  await store.updateMyConfig(toUpdate);
  isSaving.value = false;
  isSaved.value = true;
  await sleep(1500);
  isSaved.value = false;
}
</script>

<template>
  <header class="flex items-center mb-4 gap-4">
    <h1 class="text-2xl font-bold">
      AI Prompts Template Management
    </h1>
    <span
      v-if="status === 'pending'"
      class="loading loading-spinner"
    />
    <button
      :class="isSaved ? 'btn-success' : 'btn-primary'"
      :disabled="isSaving"
      type="button"
      class="btn ms-auto text-white"
      @click="doSave"
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
  <table class="table">
    <thead>
      <tr>
        <th>Template Title</th>
        <th>Fix to Reply Modal</th>
        <th>Shortcuts</th>
      </tr>
    </thead>
    <tbody v-if="promptStore.isLoading">
      <tr>
        <td colspan="3">
          <div class="h-32 flex justify-center items-center gap-2">
            <span class="loading loading-spinner" />
            Loading...
          </div>
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr
        v-for="(prompt, id) in promptStore.prompts"
        :key="id"
      >
        <td>{{ prompt.title }}</td>
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
            class="input input-bordered input-sm"
            placeholder="Shortcut"
          >
        </td>
      </tr>
    </tbody>
  </table>
</template>
