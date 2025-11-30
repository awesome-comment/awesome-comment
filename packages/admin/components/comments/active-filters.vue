<script setup lang="ts">
defineProps<{
  filterPostId: string;
  filterUser: string;
  filterTag: string;
}>();

const emit = defineEmits<{
  clearPostId: [];
  clearUser: [];
  clearTag: [];
}>();
</script>

<template>
  <div
    v-if="filterPostId || filterUser || filterTag"
    class="flex gap-4 mb-4"
  >
    <button
      v-if="filterPostId"
      class="btn btn-outline btn-sm normal-case"
      type="button"
      @click="$emit('clearPostId')"
    >
      <i class="bi bi-funnel-fill" />
      {{ filterPostId }}
      <i class="bi bi-x-lg" />
    </button>
    <button
      v-if="filterUser"
      class="btn btn-outline btn-sm normal-case"
      type="button"
      @click="$emit('clearUser')"
    >
      <i class="bi bi-funnel-fill" />
      {{ filterUser }}
      <i class="bi bi-x-lg" />
    </button>
    <button
      v-if="filterTag"
      class="btn btn-outline btn-sm normal-case"
      type="button"
      @click="$emit('clearTag')"
    >
      <i class="bi bi-tag-fill" />
      {{ filterTag }}
      <i class="bi bi-x-lg" />
    </button>
  </div>
</template>
