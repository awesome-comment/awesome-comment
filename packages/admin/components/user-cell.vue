<script setup lang="ts">
import type { User } from '@awesome-comment/core/types';
import { parseUserAgent } from '~/utils';
import { sleep } from '@antfu/utils';

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

const isNameCopied = ref<boolean>(false);
const isEmailCopied = ref<boolean>(false);
const isCustomCopied = ref<boolean>(false);

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
const agentInfo = computed<string>(() => {
  const info = parseUserAgent(props.user.agent || '');
  return `${ info.deviceType }
${ info.os } ${ info.osVersion }
${ info.browser } ${ info.browserVersion }`
    .split('\n').map(item => item.trim())
    .join('\n').replace(/\n+/g, '\n').trim();
});

async function doCopyCustomData() {
  await navigator.clipboard.writeText(JSON.stringify(props.user.custom));
  isCustomCopied.value = true;
  await sleep(1500);
  isCustomCopied.value = false;1
}
async function copyUserName() {
  await navigator.clipboard.writeText(props.user.name);
  isNameCopied.value = true;
  await sleep(1500);
  isNameCopied.value = false;
}
async function copyUserEmail() {
  await navigator.clipboard.writeText(props.user.email);
  isEmailCopied.value = true;
  await sleep(1500);
  isEmailCopied.value = false;
}
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
          class="block truncate underline font-semibold leading-none mb-1 hover:no-underline"
          target="_blank"
          :to="userLink"
        >
          {{ user.name }}
        </nuxt-link>

        <template #menu>
          <li>
            <nuxt-link
              target="_blank"
              :to="userLink"
            >
              <i class="bi bi-box-arrow-up-right" />
              Filter by user
            </nuxt-link>
          </li>
          <li>
            <button
              :class="isNameCopied ? 'bg-success' : ''"
              type="button"
              @click="copyUserName"
            >
              <i
                v-if="isNameCopied"
                class="bi bi-check-lg"
              />
              <i
                v-else
                class="bt bi-copy"
              />
              {{ isNameCopied ? 'Copied' : 'Copy Name' }}
            </button>
          </li>
          <li>
            <button
              :class="isEmailCopied ? 'bg-success' : ''"
              type="button"
              @click="copyUserEmail"
            >
              <i
                v-if="isEmailCopied"
                class="bi bi-check-lg"
              />
              <i
                v-else
                class="bt bi-copy"
              />
              {{ isEmailCopied ? 'Copied' : 'Copy Email' }}
            </button>
          </li>
        </template>
      </context-menu-dropdown>

      <div class="text-xs truncate">
        {{ user.email }}
      </div>
      <div
        v-if="user.ip"
        class="text-xs truncate hidden sm:block"
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
      <div class="text-xs capitalize hidden sm:block">
        <i
          v-if="from !== 'auth0'"
          :class="'bi-' + from"
          class="bi me-1"
        />
        {{ from }}
      </div>
      <div
        v-if="user.agent"
        class="text-xs bg-base-200 px-2 py-1 border-l-2 border-neutral hidden sm:block whitespace-pre-wrap"
      >
        {{ agentInfo }}
      </div>
      <div
        v-if="user.window"
        class="text-xs bg-base-200 px-2 py-1 border-l-2 border-neutral hidden sm:block"
      >
        {{ user.window }}
      </div>
      <div
        v-if="user.extra"
        class="text-xs bg-base-200 px-2 py-1 border-l-2 border-neutral hidden sm:block"
      >
        {{ user.extra }}
      </div>
      <button
        v-if="user.custom"
        class="btn btn-xs text-white mt-1 hidden sm:block"
        :class="isCustomCopied ? 'btn-success' : 'btn-neutral'"
        type="button"
        @click="doCopyCustomData"
      >
        <i
          v-if="isCustomCopied"
          class="bi bi-check-lg"
        />
        <template v-else>
          Copy custom data
        </template>
      </button>
    </div>
  </div>
</template>
