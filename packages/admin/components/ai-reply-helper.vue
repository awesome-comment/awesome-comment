<script setup lang="ts">
import usePromptStore from '~/store/prompt';

type Props = {
  comment: Comment;
  reply: string;
}
const props = defineProps<Props>();

const promptStore = usePromptStore();

const isNewPrompt = ref<boolean>(false);
const isManagement = ref<boolean>(false);
const isUsingTemplate = ref<boolean>(false);
const templateId = ref<string>('');

const helpOptions = computed(() => {
  const templates = Object.entries(promptStore.prompts).map(([key, value]) => {
    return {
      label: value.title,
      click() {
        doUseTemplate(key);
      },
    };
  });
  const items = [
    [
      {
        label: 'Manage prompt templates',
        icon: 'i-bi-list-ul',
        click() {
          isManagement.value = true;
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
  if (templates.length) {
    items.unshift(templates);
  }
  return items;
});

function doUseTemplate(id) {
  templateId.value = id;
  isUsingTemplate.value = true;
}

onBeforeMount(() => {
  promptStore.init();
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

  <ai-edit-prompt
    v-if="isNewPrompt"
    v-model:is-open="isNewPrompt"
  />

  <ai-prompt-management
    v-if="isManagement"
    v-model:is-open="isManagement"
  />

  <ai-use-template
    v-if="isUsingTemplate"
    v-model:is-open="isUsingTemplate"
    :prompt-id="templateId"
    :comment="comment"
    :reply="reply"
  />
</template>
