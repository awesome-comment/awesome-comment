<script setup lang="ts">
const isNewPrompt = ref<boolean>(false);
const isManagement = ref<boolean>(false);

const helpOptions = computed(() => {
  return [
    [
      {
        label: 'Manage prompt templates',
        icon: 'i-bi-list-ul',
        click() {
          isManagement.value = false;
        },
      },
      {
        label: 'Add prompt template',
        icon: 'i-bi-plus-lg',
        click() {
          isNewPrompt.value = true;
        },
      },
    ],
  ];
});
</script>

<template>
  <u-dropdown
    :items="helpOptions"
    :ui="{width: 'w-56'}"
  >
    <button
      type="button"
      class="btn btn-xs btn-info btn-outline ms-4"
      title="AI helpers"
    >
      Prompt helper
      <i class="bi bi-chevron-down" />
    </button>
  </u-dropdown>

  <ui-modal
    v-model="isNewPrompt"
    :has-button="false"
    modal-class="w-11/12 max-w-3xl"
    title="Add new prompt"
  >
    <ai-edit-prompt />
  </ui-modal>

  <ui-modal
    v-model="isManagement"
    :has-button="false"
    title="Manage prompt templates"
  >
    <ai-prompt-management />
  </ui-modal>
</template>
