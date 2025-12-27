<script setup lang="ts">
import type { AiPromptTemplate } from '~/types';
import usePromptStore from '~/store/prompt';

const route = useRoute();
const router = useRouter();
const promptStore = usePromptStore();

const currentTab = ref<string>('work');
const { data, status, refresh } = useAsyncData<AiPromptTemplate | null>(
  'prompt' + route.params.id,
  async function () {
    const id = Number(route.params.id);
    return await promptStore.getPrompt(id);
  },
  {
    default() {
      return null;
    },
  },
);

function handleSaved(id: number): void {
  refresh();
}

function handleDeleted(): void {
  router.push('/admin/ai-templates');
}

useHead({
  title: () => data.value?.title || 'Prompt',
});
</script>

<template>
  <div class="p-6">
    <div class="flex items-center gap-4 mb-4">
      <NuxtLink
        to="/admin/ai-templates"
        class="btn btn-ghost btn-sm"
      >
        <i class="bi bi-arrow-left" />
        Back
      </NuxtLink>
      <h1 class="text-2xl font-bold">
        {{ data?.title || '(loading)' }}
      </h1>
      <span
        v-if="status === 'pending'"
        class="loading loading-spinner"
      />
    </div>

    <div
      v-if="data"
      role="tablist"
      class="tabs tabs-lifted tabs-lg"
    >
      <input
        v-model="currentTab"
        type="radio"
        name="prompt_tabs"
        role="tab"
        class="tab"
        aria-label="Work"
        value="work"
      >
      <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box p-6"
      >
        <prompt-executor
          v-if="currentTab === 'work'"
          :data="data"
        />
      </div>

      <input
        v-model="currentTab"
        type="radio"
        name="prompt_tabs"
        role="tab"
        class="tab"
        aria-label="Edit"
        value="edit"
      >
      <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box p-6"
      >
        <prompt-form
          v-if="currentTab === 'edit'"
          :data="data"
          @saved="handleSaved"
          @deleted="handleDeleted"
        />
      </div>
    </div>

    <div
      v-else-if="status !== 'pending'"
      class="alert alert-error"
    >
      <i class="bi bi-exclamation-triangle" />
      Prompt not found
    </div>
  </div>
</template>
