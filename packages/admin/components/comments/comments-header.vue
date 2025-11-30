<script setup lang="ts">
import { CommentTags, Languages } from '@awesome-comment/core/data';

const props = defineProps<{
  status: 'idle' | 'pending' | 'success' | 'error';
  filterStatus: number | 'all';
  filterLanguage: string;
  filterTag: string;
  csKeys: number[];
  commentStatusEnum: typeof import('@awesome-comment/core/data').CommentStatus;
}>();

const emit = defineEmits<{
  reset: [];
  statusChange: [];
  'update:filterStatus': [value: number | 'all'];
  'update:filterLanguage': [value: string];
  'update:filterTag': [value: string];
}>();

const localFilterStatus = computed({
  get: () => props.filterStatus,
  set: (value) => emit('update:filterStatus', value),
});
const localFilterLanguage = computed({
  get: () => props.filterLanguage,
  set: (value) => emit('update:filterLanguage', value),
});
const localFilterTag = computed({
  get: () => props.filterTag,
  set: (value) => emit('update:filterTag', value),
});

function onStatusChange() {
  emit('statusChange');
}
</script>

<template>
  <header class="flex flex-col mb-4 gap-4 sm:flex-row sm:items-center">
    <h1 class="text-2xl font-bold sm:me-auto">
      Comments Management
    </h1>
    <button
      class="btn btn-sm me-2 self-end"
      type="button"
      :disabled="status === 'pending'"
      @click="$emit('reset')"
    >
      <span
        v-if="status === 'pending'"
        class="loading loading-spinner"
      />
      <i
        v-else
        class="bi bi-arrow-clockwise"
      />
      Refresh
    </button>
    <div class="form-control flex-row gap-2 me-2">
      <label
        class="label"
        for="language"
      >
        <span class="text-xs">Language</span>
      </label>
      <select
        id="language"
        v-model="localFilterLanguage"
        class="select select-bordered select-sm"
        @change="onStatusChange"
      >
        <option value="">
          All
        </option>
        <option
          v-for="lang in Languages"
          :key="lang"
          :value="lang"
        >
          {{ lang }}
        </option>
      </select>
    </div>
    <div class="form-control flex-row gap-2 me-2">
      <label
        class="label"
        for="tag"
      >
        <span class="text-xs">Tag</span>
      </label>
      <select
        id="tag"
        v-model="localFilterTag"
        class="select select-bordered select-sm"
        @change="onStatusChange"
      >
        <option value="">
          All
        </option>
        <option
          v-for="tag in CommentTags"
          :key="tag"
          :value="tag"
        >
          {{ tag }}
        </option>
      </select>
    </div>
    <div class="form-control flex-row gap-2">
      <label
        class="label"
        for="status"
      >
        <span class="text-xs">Status</span>
      </label>
      <select
        id="status"
        v-model="localFilterStatus"
        class="select select-bordered select-sm"
        @change="onStatusChange"
      >
        <option value="all">
          All
        </option>
        <option
          v-for="key in csKeys"
          :key="key"
          :value="key"
        >
          {{ commentStatusEnum[key] }}
        </option>
      </select>
    </div>
  </header>
</template>
