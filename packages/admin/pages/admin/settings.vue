<script setup lang="ts">
import { useConfigStore } from '~/store';

const store = useConfigStore();

const isSaving = ref<boolean>(false);
const adminEmails = computed<string>({
  get(): string {
    return store.config.adminEmails.join('\n');
  },
  set(value: string) {
    store.setConfig({ adminEmails: value.split('\n') });
  },
});

async function doSave(event: Event): Promise<void> {
  if (isSaving.value || (event.target as HTMLFormElement).matches(':invalid')) {
    return;
  }

  isSaving.value = true;

  isSaving.value = false;
}
</script>

<template lang="pug">
header.flex.items-center.justify-between.pb-4.mb-4.border-b
  h1.text-xl.font-bold Settings
  button.btn.btn-primary(
    form="config-form"
    :disabled="isSaving"
  )
    span.loading.loading-spinner(v-if="isSaving")
    i.bi.bi-check-lg(v-else)
    | Save
form#config-form(
  class="w-1/2"
  @submit.prevent="doSave"
)
  .form-control
    label.label
      span.label-text Admin Email
    textarea.textarea.textarea-bordered(
      required
      rows="4"
      v-model="adminEmails"
    )
    label.label
      span.label-text-alt Please use line breaks to split emails.
</template>

<script lang="ts">
export default {
  name: 'AdminSettingsPage',
}
</script>
