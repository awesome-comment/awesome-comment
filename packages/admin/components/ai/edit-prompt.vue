<script setup lang="ts">
import usePromptStore from '~/store/prompt';
import { sleep } from '@antfu/utils';
import type { UiModal } from '#components';

type Props = {
  promptId?: string;
}
const props = defineProps<Props>();
type Emits = {
  (event: 'saved', id: string): void;
  (event: 'close'): void;
}
const emit = defineEmits<Emits>();

const Variables = [
  '%TITLE%',
  '%LANG_LOCAL%',
  '%LANG_EN%',
  '%USERNAME%',
  '%COMMENT%',
];
const root = ref<UiModal>();
const textarea = ref<HTMLTextAreaElement>();
const promptStore = usePromptStore();
const isOpen = defineModel('isOpen', Boolean);

const title = ref<string>('');
const template = ref<string>('');
const isSaved = ref<boolean>(false);

async function doInsertVariable(variable: string): Promise<void> {
  if (!textarea.value) return;

  textarea.value.focus();
  const { selectionStart, selectionEnd } = textarea.value;
  const text = template.value;
  const before = text.substring(0, selectionStart);
  const after = text.substring(selectionEnd);
  template.value = before + variable + after;
  await nextTick();
  textarea.value.selectionStart = textarea.value.selectionEnd = selectionStart + variable.length;
}
async function doSubmit(event: Event): Promise<void> {
  if ((event.target as HTMLFormElement).matches(':invalid')) return;

  const id = promptStore.setPrompt({
    title: title.value,
    template: template.value,
  }, props.promptId);

  isSaved.value = true;
  await sleep(1500);
  isSaved.value = false;
  emit('saved', id);
  root.value?.close();
}

function onModalOpen() {
  const prompt = promptStore.prompts[ props.promptId ];
  if (prompt) {
    title.value = prompt.title;
    template.value = prompt.template;
  } else {
    title.value = '';
    template.value = '';
  }
}
</script>

<template>
  <ui-modal
    ref="root"
    v-model="isOpen"
    :has-button="false"
    modal-class="w-11/12 max-w-3xl"
    title="Add new prompt"
    @open="onModalOpen"
    @close="emit('close')"
  >
    <form
      @submit.prevent="doSubmit"
    >
      <div class="form-control mb-4">
        <label
          class="label"
          for="prompt-title"
        >
          <span class="label-text">Title</span>
        </label>
        <input
          id="prompt-title"
          v-model="title"
          class="input input-bordered input-sm"
          required
          placeholder="Enter title"
        >
      </div>
      <div class="form-control mb-4">
        <label
          class="label"
          for="prompt-text"
        >
          <span class="label-text">Prompt template</span>
        </label>
        <textarea
          id="prompt-text"
          ref="textarea"
          v-model="template"
          class="textarea textarea-bordered"
          required
          placeholder="Enter prompt template"
          rows="4"
        />
        <div class="flex pt-2">
          <button
            v-for="variable in Variables"
            :key="variable"
            type="button"
            class="btn btn-xs btn-ghost"
            @click="doInsertVariable(variable)"
          >
            {{ variable }}
          </button>
        </div>
      </div>
      <div class="flex justify-end gap-4">
        <button
          type="button"
          class="btn btn-ghost btn-sm"
        >
          Cancel
        </button>
        <button
          class="btn btn-sm min-w-64 text-white"
          :class="isSaved ? 'btn-success' : 'btn-primary'"
        >
          <i
            v-if="isSaved"
            class="bi bi-check"
          />
          <template v-else>
            Save
          </template>
        </button>
      </div>
    </form>
  </ui-modal>
</template>
