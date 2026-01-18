<script setup lang="ts">
import type { UiModal } from '#components';

type Props = {
  prompt: string;
};
defineProps<Props>();
type Emits = {
  (event: 'submit'): void;
  (event: 'close', isSubmit: boolean): void;
};
const emit = defineEmits<Emits>();

const root = ref<typeof UiModal>(null!);

function doSubmit(): void {
  emit('submit');
  emit('close', true);
}

onMounted(() => {
  root.value?.open();
});
</script>

<template>
  <ui-modal
    ref="root"
    title="Preview Prompt"
    :has-button="false"
    @close="emit('close')"
  >
    <p class="whitespace-pre-wrap font-mono flex-1 px-4 py-2 bg-base-200 max-h-80 overflow-auto ">
      {{ prompt }}
    </p>
    <div class="flex justify-end items-center mt-4">
      <button
        type="button"
        class="btn btn-primary btn-sm text-white"
        @click="doSubmit"
      >
        Submit
      </button>
    </div>
  </ui-modal>
</template>
