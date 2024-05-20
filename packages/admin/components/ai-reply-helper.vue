<script setup lang="ts">
const isOpenModal = ref<boolean>(false);
const isCreating = ref<boolean>(false);

const helpOptions = computed(() => {
  return [
    [
      {
        label: 'Manage prompt templates',
        icon: 'i-bi-list-ul',
        click() {
          isCreating.value = false;
          isOpenModal.value = true;
        },
      },
      {
        label: 'Add prompt template',
        icon: 'i-bi-plus-lg',
        click() {
          isCreating.value = true;
          isOpenModal.value = true;
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

  <ui-modal v-model="isOpenModal" :has-button="false">
    <ai-prompt-management
      v-if="!isCreating"
    />
  </ui-modal>
</template>
