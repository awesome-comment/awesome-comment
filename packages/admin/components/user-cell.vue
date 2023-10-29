<script setup lang="ts">
const props = defineProps<{
  from: string;
  user: {
    avatar?: string;
    name?: string;
    email?: string;
    ip?: string;
  }
}>();

const from = computed(() => {
  if (props.from.includes('google')) return 'google';
  return props.from;
});
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
    .text-xs(v-if="user.ip")
      nuxt-link.link(
        class="hover:no-underline"
        target="_blank"
        external
        :to="`https://clients1.google.co.in/url?sa=i&url=https://www.ip138.com/iplookup.php?ip=${user.ip}&action=2`"
      ) {{ user.ip }}
    .text-xs.capitalize
      i.bi.mr-1(
        v-if="from !== 'auth0'"
        :class="'bi-' + from"
      )
      | {{ from }}
</template>
