<script setup lang="ts">
import type { AiPromptTemplate } from '~/types';
import usePromptStore from '~/store/prompt';

type Props = {
  data?: AiPromptTemplate;
  isNew?: boolean;
};
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'saved', id: number): void;
  (e: 'deleted'): void;
}>();

const promptStore = usePromptStore();

const isSaving = ref<boolean>(false);
const isDeleting = ref<boolean>(false);
const isForking = ref<boolean>(false);
const title = ref<string>(props.data?.title || '');
const content = ref<string>(props.data?.content || '');
const allowEmails = ref<string[]>(props.data?.allowed_emails || []);
const saveStatus = ref<boolean>(false);
const message = ref<string>('');

async function doSubmit(event?: Event): Promise<void> {
  if (event && (event.target as HTMLFormElement).matches(':invalid')) return;
  if (isSaving.value || isDeleting.value) return;

  isSaving.value = true;
  saveStatus.value = false;
  message.value = '';

  try {
    const newTitle = title.value + (isForking.value ? ' (copied)' : '');
    let id: number;

    if (props.data && !isForking.value) {
      // Update existing
      await promptStore.updatePrompt(props.data.id, newTitle, content.value, allowEmails.value);
      id = props.data.id;
      message.value = 'Prompt updated';
    } else {
      // Create new
      id = await promptStore.createPrompt(newTitle, content.value, allowEmails.value);
      message.value = 'Prompt created';
    }

    promptStore.setPrompts([
      {
        id,
        title: newTitle,
        content: content.value,
        owner: props.data?.owner || '',
        allowed_emails: allowEmails.value,
      },
    ]);

    if (props.isNew || isForking.value) {
      title.value = '';
      content.value = '';
    }

    saveStatus.value = true;
    emit('saved', id);
  } catch (error) {
    message.value = 'Failed to save prompt. ' + ((error as Error).message || String(error));
  }
  isSaving.value = false;
  isForking.value = false;
}

async function doFork(): Promise<void> {
  isForking.value = true;
  await doSubmit();
}

async function doDelete(): Promise<void> {
  if (!props.data || isSaving.value || isDeleting.value) return;
  if (!confirm('Are you sure to delete this prompt?')) return;

  isDeleting.value = true;
  try {
    await promptStore.deletePrompt(props.data.id);
    emit('deleted');
  } catch (error) {
    message.value = 'Failed to delete prompt. ' + (error as Error).message;
  }
  isDeleting.value = false;
}

watch(
  () => props.data,
  () => {
    title.value = props.data?.title || '';
    content.value = props.data?.content || '';
    allowEmails.value = props.data?.allowed_emails || [];
  },
);
</script>

<template>
  <form
    class="max-w-2xl mx-auto"
    @submit.prevent="doSubmit"
  >
    <header class="text-xl font-semibold mb-4 border-b pb-2">
      {{ data ? 'Edit Prompt' : 'Create Prompt' }}
    </header>
    <div class="mb-4">
      <label
        class="label"
        for="title"
      >
        <span class="label-text">Title</span>
      </label>
      <input
        id="title"
        v-model="title"
        class="input input-bordered w-full"
        :disabled="isSaving || isDeleting"
        required
        placeholder="Prompt title"
      >
    </div>
    <div class="mb-4">
      <label
        class="label"
        for="content"
      >
        <span class="label-text">Content</span>
      </label>
      <textarea
        id="content"
        v-model="content"
        class="textarea textarea-bordered w-full"
        :disabled="isSaving || isDeleting"
        required
        placeholder="Prompt content. Use $variable$ for replaceable variables."
        rows="12"
      />
    </div>
    <div
      v-if="message"
      class="alert mb-4 text-white"
      :class="saveStatus ? 'alert-success' : 'alert-error'"
    >
      <p>{{ message }}</p>
    </div>
    <div class="flex gap-4">
      <button
        class="btn btn-primary flex-1"
        :disabled="isSaving || isDeleting"
      >
        <span
          v-if="isSaving && !isForking"
          class="loading loading-spinner"
        />
        <i
          v-else
          class="bi bi-check-lg"
        />
        {{ data ? 'Save Prompt' : 'Create Prompt' }}
      </button>
      <button
        v-if="data"
        type="button"
        class="btn btn-success text-white"
        :disabled="isSaving || isDeleting"
        @click="doFork"
      >
        <span
          v-if="isForking"
          class="loading loading-spinner"
        />
        <i
          v-else
          class="bi bi-signpost-split"
        />
        Fork
      </button>
      <button
        v-if="data"
        type="button"
        class="btn btn-error ms-auto text-white"
        :disabled="isSaving || isDeleting"
        @click="doDelete"
      >
        <span
          v-if="isDeleting"
          class="loading loading-spinner"
        />
        <i
          v-else
          class="bi bi-trash3"
        />
        Delete
      </button>
    </div>
  </form>
</template>
