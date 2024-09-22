<script setup lang="ts">
type Props = {
  disabled?: boolean;
  isLoading?: boolean;
}
defineProps<Props>();
type Emits = {
  (event: 'delete'): void;
}
const emit = defineEmits<Emits>();

const MaxWaiting = 5;

const isPending = ref<boolean>(false);
const count = ref<number>(0);
let interval = 0;

async function onClick(): Promise<void> {
  if (isPending.value) {
    isPending.value = false;
    clearInterval(interval);
    return;
  }

  isPending.value = true;
  interval = setInterval(() => {
    count.value++;
    if (count.value >= MaxWaiting) {
      clearInterval(interval);
      isPending.value = false;
      count.value = 0;
      emit('delete');
    }
  }, 1000);
}
</script>

<template>
  <button
    class="btn btn-outline btn-error btn-sm sm:btn-xs hover:text-white"
    type="button"
    :disabled="disabled"
    @click="onClick"
  >
    <template v-if="isPending">Cancel ({{MaxWaiting - count}})</template>
    <span v-else-if="isLoading" class="loading loading-xs loading-spinner" />
    <template v-else>Delete</template>
  </button>
</template>
