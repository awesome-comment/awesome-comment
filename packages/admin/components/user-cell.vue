<script setup lang="ts">
const props = defineProps<{
  user: {
    avatar?: string;
    name?: string;
    email?: string;
    ip?: string;
  }
}>();
</script>

<template lang="pug">
.flex.gap-2.items-center
  .avatar(v-if="user.avatar")
    .w-8.rounded
      img(:src="user.avatar" alt="avatar")
  .avatar.placeholder(v-else-if="user.name")
    .bg-neutral-focus.text-neutral-content.rounded-full.w-8
      span.text-xs.uppercase {{ user.name[0] }}
  .flex.flex-col.gap-1.w-40
    .truncate {{ user.name }}
    .text-xs.truncate {{ user.email }}
    .text-xs(v-if="user.ip") {{ user.ip }}
</template>
