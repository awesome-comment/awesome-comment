<script setup lang="ts">
import type { User } from '@awesome-comment/core/types';

type Props = {
  from: string;
  user: User;
  userId: string;
  filter: URLSearchParams;
};
const props = defineProps<Props>();
type Emits = {
  (event: 'select-user', userId: string): void;
}
const emit = defineEmits<Emits>();

const from = computed(() => {
  if (props.from.includes('google')) return 'google';
  return props.from;
});
const filterLink = computed<string>(() => {
  const params = new URLSearchParams(props.filter);
  params.set('user', props.userId);
  return '?' + params.toString();
});
</script>

<template lang="pug">
.flex.gap-2.items-start
  .avatar(v-if="user.avatar")
    .w-8.rounded
      img(:src="user.avatar" alt="avatar")
  .avatar.placeholder(v-else-if="user.name")
    .bg-neutral-focus.text-neutral-content.rounded-full.w-8
      span.text-xs.uppercase {{ user.name[0] }}
  .flex.flex-col.gap-1.w-40
    nuxt-link.truncate.underline.font-semibold.leading-none.mb-1(
      class="hover:no-underline"
      :to="filterLink"
      @click="emit('select-user', props.userId)"
    ) {{ user.name }}
    .text-xs.truncate {{ user.email }}
    .text-xs(v-if="user.ip")
      nuxt-link.link(
        class="hover:no-underline"
        target="_blank"
        external
        :to="`https://clients1.google.co.in/url?sa=i&url=https://www.ipshudi.com/${user.ip}.htm`"
      ) {{ user.ip }}
    .text-xs.capitalize
      i.bi.me-1(
        v-if="from !== 'auth0'"
        :class="'bi-' + from"
      )
      | {{ from }}
</template>
