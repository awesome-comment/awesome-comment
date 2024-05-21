<script setup lang="ts">
const Variables = [
  '%TITLE%',
  '%LANG_LOCAL%',
  '%LANG_EN%',
  '%USERNAME%',
  '%COMMENT%',
];
const textarea = ref<HTMLTextAreaElement>();

const title = ref<string>('');
const prompt = ref<string>('');

async function doInsertVariable(variable: string): Promise<void> {
  if (!textarea.value) return;

  textarea.value.focus();
  const { selectionStart, selectionEnd } = textarea.value;
  const text = prompt.value;
  const before = text.substring(0, selectionStart);
  const after = text.substring(selectionEnd);
  prompt.value = before + variable + after;
  await nextTick();
  textarea.value.selectionStart = textarea.value.selectionEnd = selectionStart + variable.length;
}
function doSubmit(event: Event): void {
  if ((event.target as HTMLFormElement).matches(':invalid')) return;


}
</script>

<template>
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
        v-model="prompt"
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
        class="btn btn-primary btn-sm w-1/2"
      >
        Save
      </button>
    </div>
  </form>
</template>
