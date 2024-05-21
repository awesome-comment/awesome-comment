<script setup lang="ts">
import * as net from 'node:net';

type Props = {
  buttonClass?: string;
  buttonLabel?: string;
  modalClass?: string;
  disabled?: boolean;
  hasButton?: boolean;
  isLoading?: boolean;
  modelValue?: boolean;
  title?: string;
}
const props = withDefaults(defineProps<Props>(), {
  buttonClass: 'btn-info btn-sm',
  buttonLabel: 'Open Modal',
  modalClass: '',
  disabled: false,
  hasButton: true,
  isLoading: false,
  modelValue: false,
  title: 'Modal Title',
});
type Emits = {
  (event: 'update:modelValue', value: boolean): void;
}
const emit = defineEmits<Emits>();

const modal = ref<HTMLDialogElement>();

const isOpenModal = ref<boolean>(false);

async function doOpenModal(): Promise<void> {
  isOpenModal.value = true;
  await nextTick();
  modal.value?.showModal();
}
function close(): void {
  modal.value?.close();
  emit('update:modelValue', false);
}

watch(() => props.modelValue, (value: boolean) => {
  if (value) {
    doOpenModal();
  } else {
    close();
  }
});

defineExpose({
  close,
});
</script>

<template>
  <button
    v-if="hasButton"
    type="button"
    class="btn"
    :class="buttonClass"
    :disabled="disabled"
    @click="doOpenModal"
  >
    <slot name="button">
      <span
        v-if="isLoading"
        class="loading loading-spinner"
      />
      {{ buttonLabel }}
    </slot>
  </button>

  <teleport
    v-if="isOpenModal"
    to="body"
  >
    <dialog
      ref="modal"
      class="modal"
      @close="isOpenModal = false"
    >
      <div
        class="modal-box"
        :class="modalClass"
      >
        <header class="mb-4 flex items-center">
          <h3 class="text-lg font-medium">
            {{ title }}
          </h3>
          <form
            method="dialog"
            class="ms-auto"
          >
            <button class="btn btn-sm btn-circle btn-ghost outline-none">
              ✕
            </button>
          </form>
        </header>
        <slot />
      </div>
      <form
        method="dialog"
        class="modal-backdrop"
      >
        <button>x</button>
      </form>
    </dialog>
  </teleport>
</template>

<script lang="ts">
export default {
  name: 'UiDrawer',
}
</script>
