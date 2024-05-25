<script setup lang="ts">
import usePromptStore from '~/store/prompt';

const isOpen = defineModel('isOpen', Boolean);
const promptStore = usePromptStore();

const isNewPrompt = ref<boolean>(false);
const targetId = ref<string>('');

function doDelete(id: string) {
  if (!confirm('Are you sure you want to delete this prompt?')) return;
  promptStore.deletePrompt(id);
}
function doEdit(id: string) {
  isNewPrompt.value = true;
  targetId.value = id;
}

onBeforeMount(() => {
  promptStore.init();
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
    <template #header>
      <button
        type="button"
        class="btn btn-xs btn-primary ms-4 text-white"
        title="Add prompt template"
        @click="isNewPrompt = true"
      >
        <i class="bi bi-plus-lg" />
        Add prompt
      </button>
    </template>
    <table class="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(prompt, id) in promptStore.prompts"
          :key="id"
        >
          <td>{{ prompt.title }}</td>
          <td>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="btn btn-xs btn-info text-white"
                title="Edit prompt"
                @click="doEdit(id)"
              >
                <i class="bi bi-pencil" />
                Edit
              </button>
              <button
                type="button"
                class="btn btn-xs btn-error text-white"
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
    v-model:is-open="isNewPrompt"
    :prompt-id="targetId"
    @close="targetId = ''"
  />
</template>
