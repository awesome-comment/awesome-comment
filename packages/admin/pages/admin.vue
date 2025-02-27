<script setup lang="ts">
const links = [
  {
    label: 'Comments Management',
    icon: 'chat-dots-fill',
    path: 'comments',
  },
  {
    label: 'Comments by Post ID',
    icon: 'list-ul',
    path: 'by-post',
  },
  {
    label: 'Daily Stat by Language',
    icon: 'calendar',
    path: 'daily-stat-by-lang',
  },
  {
    label: 'Daily Stat by User',
    icon: 'person-fill',
    path: 'daily-stat-by-user',
  },
  {
    label: 'AI Prompt Management',
    icon: 'ui-checks-grid',
    path: 'ai-templates',
  },
  {
    label: 'Settings',
    icon: 'gear-fill',
    path: 'settings',
  },
];

const route = useRoute();
const path = computed<string>(() => {
  return route.path;
});

useHead({
  title: 'Admin | Awesome comment',
  description: 'Admin',
});
definePageMeta({
  layout: 'admin',
  name: 'Admin',
});
</script>

<template>
  <div class="container mx-auto flex flex-col p-4 gap-4 xl:flex-row">
    <aside class="w-auto flex-none xl:w-64">
      <ul class="menu menu-horizontal bg-base-200 rounded-box xl:menu-vertical">
        <li
          v-for="item in links"
          :key="item.path"
        >
          <nuxt-link
            active-class="active"
            :to="'/admin/' + item.path"
          >
            <i
              class="bi"
              :class="'bi-' + item.icon"
            />{{ item.label }}
          </nuxt-link>
        </li>
      </ul>
    </aside>
    <div class="flex-1">
      <nuxt-page />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AdminIndexPage',
}
</script>
