<script setup lang="ts">
type Props = {
  buttonClass?: string;
  buttonIcon?: string;
  buttonLabel?: string;
  modalClass?: string;
  disabled?: boolean;
  hasButton?: boolean;
  isLoading?: boolean;
  modelValue?: boolean;
  title?: string;
};
const props = withDefaults(defineProps<Props>(), {
  buttonClass: 'btn-info btn-sm',
  buttonIcon: '',
  buttonLabel: 'Open Modal',
  modalClass: '',
  disabled: false,
  hasButton: true,
  isLoading: false,
  modelValue: false,
  title: 'Modal Title',
});
type Emits = {
  (event: 'open'): void;
  (event: 'close'): void;
  (event: 'update:modelValue', value: boolean): void;
};
const emit = defineEmits<Emits>();

const modal = ref<HTMLDialogElement>();

const isKeepModal = ref<boolean>(false);
const isOpenModal = ref<boolean>(false);

async function doOpenModal(): Promise<void> {
  isOpenModal.value = true;
  await nextTick();
  modal.value?.showModal();
  emit('open');
}
function close(keepModal = false): void {
  if (!modal.value) return;
  isKeepModal.value = keepModal;
  if (modal.value.open) {
    modal.value?.close();
  } else {
    isOpenModal.value = false;
  }
}
function onClose(): void {
  if (!isKeepModal.value) {
    isOpenModal.value = false;
  }
  emit('update:modelValue', false);
  emit('close');
}

watch(
  () => props.modelValue,
  (value: boolean) => {
    if (value) {
      doOpenModal();
    } else {
      close();
    }
  },
);

defineExpose({
  open: doOpenModal,
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
      <i
        v-else-if="buttonIcon"
        :class="buttonIcon"
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
      @close="onClose"
    >
      <div
        class="modal-box"
        :class="modalClass"
      >
        <header class="mb-4 flex items-center">
          <h3 class="text-lg font-medium truncate">
            {{ title }}
          </h3>
          <slot name="header" />
          <form
            method="dialog"
            class="ms-auto"
          >
            <button class="btn btn-sm btn-circle btn-ghost outline-hidden">
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
  name: 'UiModal',
}
</script>
