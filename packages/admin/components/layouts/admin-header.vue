<script setup lang="ts">
import { useAuth0, User } from '@auth0/auth0-vue';

const auth0 = import.meta.client ? useAuth0() : undefined;
const runtime = useRuntimeConfig();

const user = computed<User | null>(() => {
  return auth0?.user.value || null;
});
const items = computed(() => {
  return [
    [
      {
        label: user.value?.name || user.value?.email,
        avatar: {
          src: user.value?.picture,
        },
        type: 'label',
      },
    ],
    [
      {
        label: 'Logout',
        icon: 'i-lucide-arrow-left',
        async click() {
          await auth0?.logout();
        },
      },
    ],
    [
      {
        label: `Version: ${runtime.public.version}`,
      },
    ],
  ];
});
</script>

<template>
  <header class="bg-base-200">
    <div class="navbar container mx-auto">
      <div class="flex-1">
        <nuxt-link
          class="btn btn-ghost text-xl"
          to="/admin"
        >
          AC Admin
        </nuxt-link>
      </div>
      <div class="flex-none">
        <u-dropdown-menu
          v-if="user"
          arrow
          :items="items"
          :content="{
            align: 'end',
            side: 'bottom',
          }"
        >
          <u-avatar
            :alt="user.name || user.email || 'User'"
            size="md"
            :src="user.picture || ''"
          />
        </u-dropdown-menu>
        <nuxt-link
          v-else
          class="btn btn-sm btn-primary"
          to="/admin/login"
        >
          Login
        </nuxt-link>
      </div>
    </div>
  </header>
</template>
