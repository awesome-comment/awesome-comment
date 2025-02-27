<script setup lang="ts">
import { useAuth0, User } from '@auth0/auth0-vue';

const auth0 = process.client ? useAuth0() : undefined;

const user = computed<User | null>(() => {
  return auth0?.user.value || null;
});
const items = computed(() => {
  return [
    [
      {
        label: user.value?.name || user.value?.email,
        slot: 'account',
        disabled: true
      },
    ],
    [
      {
        label: 'Logout',
        icon: 'bi-box-arrow-left',
        async click() {
          await auth0?.logout();
        },
      },
    ],
    [
      {
        label: `Version: ${__VERSION__}`,
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
        <u-dropdown
          v-if="user"
          :items="items"
          :popper="{ placement: 'bottom-end' }"
          :ui="{ item: { disabled: 'cursor-text select-text' } }"
        >
          <div
            class="avatar cursor-pointer"
          >
            <div class="w-8 rounded-full">
              <img
                class="block"
                :src="user.picture"
                :alt="user.name"
              >
            </div>
          </div>

          <template #account="{ item }">
            <div class="text-left">
              <p>
                Signed in as
              </p>
              <p class="truncate font-medium text-gray-900 dark:text-white">
                {{ item.label }}
              </p>
            </div>
          </template>
        </u-dropdown>
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
