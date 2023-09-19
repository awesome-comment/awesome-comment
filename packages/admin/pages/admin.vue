<script setup lang="ts">
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
.container.mx-auto.flex.py-8.gap-4
  aside.w-56
    ul.menu.bg-base-200.rounded-box
      li(
        v-for="item in links"
        :key="item.path"
      )
        nuxt-link(
          :class="{active: path === '/admin/' + item.path}"
          :to="'/admin/' + item.path"
        )
          i.bi.mr-2(:class="'bi-' + item.icon")
          | {{item.label}}

  .flex-1
    nuxt-page
</template>

<script lang="ts">
export default {
  name: 'AdminIndexPage',
}
</script>
