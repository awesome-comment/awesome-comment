<script setup lang="ts">
const router = useRouter();

function handleSaved(id: number): void {
  router.push(`/admin/prompts/${id}`);
}

useHead({
  title: 'New Prompt',
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
        Create New Prompt
      </h1>
    </div>

    <prompt-form
      is-new
      @saved="handleSaved"
    />
  </div>
</template>
