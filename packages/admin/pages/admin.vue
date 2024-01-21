<script setup lang="ts">
definePageMeta({
  title: 'Admin | Awesome comment',
  description: 'Admin',
  redirect: '/admin/login',
});

const links = [
  {
    label: 'Comments Management',
    icon: 'chat-dots-fill',
    path: 'comments',
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
})
</script>

<template lang="pug">
.container.mx-auto.flex.flex-col.p-4.gap-4(class="xl:flex-row sm:px-0 sm:py-8")
  aside.w-auto.flex-none(class="xl:w-64")
    ul.menu.menu-horizontal.bg-base-200.rounded-box(class="xl:menu-vertical")
      li(
        v-for="item in links"
        :key="item.path"
      )
        nuxt-link(
          :class="{active: path === '/admin/' + item.path}"
          :to="'/admin/' + item.path"
        )
          i.bi(:class="'bi-' + item.icon")
          | {{item.label}}

  .flex-1
    nuxt-page
</template>

<script lang="ts">
export default {
  name: 'AdminIndexPage',
}
</script>
