<script setup lang="ts">
const isOpen = ref<boolean>(false);

function onContextMenu() {
  isOpen.value = true;
}

function onBodyClick(event: MouseEvent) {
  if (event.target instanceof HTMLElement && event.target.closest('.menu')) return;

  isOpen.value = false;
}

onMounted(() => {
  window.addEventListener('click', onBodyClick);
});
onBeforeUnmount(() => {
  window.removeEventListener('click', onBodyClick);
});
</script>

<template>
  <div
    class="dropdown"
    :class="{'dropdown-open': isOpen}"
    @contextmenu.prevent="onContextMenu"
  >
    <slot />

    <ul
      v-if="isOpen"
      class="p-1 shadow-sm menu dropdown-content z-1 bg-base-100 rounded-box w-52"
    >
      <slot name="menu" />
    </ul>
  </div>
</template>
