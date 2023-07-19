<script setup lang="ts">
const props = defineProps({
  user: Object as PropType<{
    avatar: string,
    name: string,
    email: string,
  }>
})
</script>

<template lang="pug">
.flex.gap-4.justify-center
  .avatar(v-if="user.avatar")
    .w-8.rounded
      img(:src="user.avatar" alt="avatar")
  .avatar.placeholder(v-else-if="user.name")
    .bg-neutral-focus.text-neutral-content.rounded-full.w-8
      span.text-xs.uppercase {{ user.name[0] }}
  .flex.flex-column.gap-3
    .text-neutral {{ user.name }}
    .text-sm.text-neutral-content {{ user.email }}
</template>
