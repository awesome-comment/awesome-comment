<script setup lang="ts">
import { sleep } from '@antfu/utils';

type Props = {
  modelValue: boolean;
}
const props = defineProps<Props>();
type Emits = {
  (event: 'update:modelValue', value: boolean): void;
};
const emit = defineEmits<Emits>();

const itemId = useId();
const isOpen = ref<boolean>(false);

async function onChange(): Promise<void> {
  if (!isOpen.value) {
    await sleep(200);
    emit('update:modelValue', false);
  }
}

watch(() => props.modelValue, async (value: boolean) => {
  await nextTick();
  isOpen.value = value;
});
</script>

<template>
  <teleport to="body">
    <div
      v-if="modelValue"
      class="drawer drawer-end z-10"
    >
      <input
        :id="itemId"
        v-model="isOpen"
        type="checkbox"
        class="drawer-toggle"
        @change="onChange"
      >

      <div class="drawer-side">
        <label
          :for="itemId"
          aria-label="close sidebar"
          class="drawer-overlay"
        />
        <div class="w-80 min-h-full bg-base-200 text-base-content">
          <slot />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
export default {
  name: 'UiDrawer',
}
</script>
