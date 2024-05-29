<script setup lang="ts">
import type { UiModal } from '#components';
import usePromptStore from '~/store/prompt';
import { readFile } from '~/utils/ui';

const promptStore = usePromptStore();
const root = ref<UiModal>();

const isOpen = defineModel('isOpen', Boolean);
const isNewPrompt = ref<boolean>(false);
const isFork = ref<boolean>(false);
const targetId = ref<string>('');
const isAutoCopy = computed<boolean>({
  get() {
    return promptStore.isAutoCopy;
  },
  set(value: boolean) {
    promptStore.setAutoCopy(value);
  },
});

function doDelete(id: string) {
  if (!confirm('Are you sure you want to delete this prompt?')) return;
  promptStore.deletePrompt(id);
}
function doEdit(id: string) {
  isFork.value = false;
  isNewPrompt.value = true;
  targetId.value = id;
}
function doFork(id: string): void {
  isNewPrompt.value = true;
  isFork.value = true;
  targetId.value = id;
}
function doNew(): void {
  targetId.value = '';
  isNewPrompt.value = true;
}
function doSetPrompt(event: Event, id: string): void {
  const checkbox = event.target as HTMLInputElement;
  promptStore.setPromptProp(id, { isFix: checkbox.checked });
}
function doExport(): void {
  // download all prompts
  const blob = new Blob([JSON.stringify(promptStore.prompts)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'prompt-templates.json';
  a.click();
  URL.revokeObjectURL(url);
}
async function doImport(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[ 0 ];
  if (!file) return;

  if (promptStore.length
    && !confirm('Continue importing will overwrite all existing prompts, are you sure?'))
  {
    return
  }

  const data = await readFile(file);
  if (!data) return;

  promptStore.importPrompts(data);
}

onBeforeMount(() => {
  promptStore.init();
});

onMounted(() => {
  root.value?.open();
});
</script>

<template>
  <ui-modal
    ref="root"
    v-model="isOpen"
    :has-button="false"
    modal-class="w-11/12 max-w-3xl"
    title="Manage prompt templates"
  >
    <header class="flex items-center mb-4">
      <button
        type="button"
        class="btn btn-xs btn-primary text-white hover:text-white"
        title="Add prompt template"
        @click="doNew"
      >
        <i class="bi bi-plus-lg" />
        Add prompt
      </button>
      <div class="form-control ms-4">
        <label class="label cursor-pointer gap-2 py-0">
          <input
            v-model="isAutoCopy"
            type="checkbox"
            class="checkbox"
            :class="{'checkbox-success': isAutoCopy}"
          >
          <span class="label-text">Auto copy</span>
        </label>
      </div>
      <button
        type="button"
        class="btn btn-xs btn-neutral ms-auto"
        title="Export prompt templates"
        @click="doExport"
      >
        <i class="bi bi-download" />
        Export
      </button>
      <label
        role="button"
        class="btn btn-xs btn-neutral ms-2"
        title="Import prompt templates"
      >
        <input
          type="file"
          accept="application/json"
          class="hidden"
          @change="doImport"
        >
        <i class="bi bi-upload" />
        Import
      </label>
    </header>
    <table class="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Fix</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody class="sm:max-h-80 sm:overflow-auto">
        <tr
          v-for="(prompt, id) in promptStore.prompts"
          :key="id"
        >
          <td>{{ prompt.title }}</td>
          <td>
            <input
              v-model="prompt.isFix"
              type="checkbox"
              class="checkbox"
              name="is-fix"
              @change="doSetPrompt($event, id)"
            >
          </td>
          <td>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="btn btn-xs btn-info text-white hover:text-white"
                title="Edit prompt"
                @click="doEdit(id)"
              >
                <i class="bi bi-pencil" />
                Edit
              </button>
              <button
                type="button"
                class="btn btn-xs btn-success text-white hover:text-white"
                title="Fork prompt"
                @click="doFork(id)"
              >
                <i class="bi bi-copy" />
                Fork
              </button>
              <button
                type="button"
                class="btn btn-xs btn-error text-white hover:text-white"
                title="Delete prompt"
                @click="doDelete(id)"
              >
                <i class="bi bi-trash3" />
                Delete
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </ui-modal>

  <ai-edit-prompt
    v-if="isNewPrompt"
    v-model:is-open="isNewPrompt"
    :is-fork="isFork"
    :prompt-id="targetId"
  />
</template>
