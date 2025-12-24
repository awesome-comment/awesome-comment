<script setup lang="ts">
const auth = useAdminAuth();
const runtime = useRuntimeConfig();

const user = computed(() => auth.user.value);
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
          await auth.logout();
        },
      },
    ],
    [
      {
        label: `Version: ${runtime.public.VERSION}`,
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
        <button
          v-else
          class="btn btn-sm btn-primary"
          type="button"
          @click="auth.login()"
        >
          Login
        </button>
      </div>
    </div>
  </header>
</template>
