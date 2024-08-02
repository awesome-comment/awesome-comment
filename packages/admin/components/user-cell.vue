<script setup lang="ts">
import type { User } from '@awesome-comment/core/types';
import { isMac } from '@awesome-comment/core/utils';
import type { UserAgentInfo } from '~/types';
import { parseUserAgent } from '~/utils';

type Props = {
  from: string;
  user: User;
  userId: string;
  prefix?: string;
  filter?: URLSearchParams;
};
const props = withDefaults(defineProps<Props>(), {
  prefix: '',
  filter() {
    return new URLSearchParams();
  },
});
type Emits = {
  (event: 'select-user', userId: string): void;
}
const emit = defineEmits<Emits>();

const route = useRoute();
const from = computed(() => {
  if (props.from.includes('google')) return 'google';
  return props.from;
});
const localPrefix = computed<string>(() => {
  return props.prefix || route.path;
})
const userLink = computed<string>(() => {
  const params = new URLSearchParams();
  params.set('user', props.userId);
  params.set('status', 'all');
  return `${localPrefix.value}?${params.toString()}`;
});
const agentInfo = computed<UserAgentInfo>(() => {
  return parseUserAgent(props.user.agent);
});
</script>

<template>
  <div class="flex gap-2 items-start">
    <div
      v-if="user.avatar"
      class="avatar"
    >
      <div class="w-8 rounded">
        <img
          :src="user.avatar"
          alt="avatar"
        >
      </div>
    </div>
    <div
      v-else-if="user.name"
      class="avatar placeholder"
    >
      <div class="bg-neutral-focus text-neutral-content rounded-full w-8">
        <span class="text-xs uppercase">{{
          user.name[0]
        }}</span>
      </div>
    </div>
    <div class="flex flex-col gap-1 w-40">
      <context-menu-dropdown>
        <nuxt-link
          :to="userLink"
          class="block truncate underline font-semibold leading-none mb-1 hover:no-underline"
        >
          {{ user.name }}
        </nuxt-link>

        <template #menu>
          <li>
            <nuxt-link
              target="_blank"
              :to="userLink"
            >
              <i class="bi bi-box-arrow-up-right me-2" />
              Filter by user
            </nuxt-link>
          </li>
        </template>
      </context-menu-dropdown>

      <div class="text-xs truncate">
        {{ user.email }}
      </div>
      <div
        v-if="user.ip"
        class="text-xs"
      >
        <nuxt-link
          :to="`https://clients1.google.co.in/url?sa=i&url=https://www.ipshudi.com/${user.ip}.htm`"
          class="link hover:no-underline"
          external="external"
          target="_blank"
        >
          {{ user.ip }}
        </nuxt-link>
      </div>
      <div class="text-xs capitalize">
        <i
          v-if="from !== 'auth0'"
          :class="'bi-' + from"
          class="bi me-1"
        />{{ from }}
      </div>
      <div
        v-if="user.agent"
        class="text-xs bg-base-200 px-2 py-1 border-l-2 border-neutral"
      >
        {{ agentInfo.deviceType }}<br>{{ agentInfo.os }} {{ agentInfo.osVersion }}<br>{{ agentInfo.browser }}
        {{ agentInfo.browserVersion }}
      </div>
      <div
        v-if="user.window"
        class="text-xs bg-base-200 px-2 py-1 border-l-2 border-neutral"
      >
        Resolution:
        {{ user.window }}
      </div>
    </div>
  </div>
</template>
