<script setup lang="ts">

</script>

<template lang="pug">
header.navbar.bg-base-200
  .container.mx-auto.flex
    .flex-1
      nuxt-link.btn.btn-ghost.normal-case.text-xl(to="/") Awesome Comment
    .flex-none
      ul.menu.menu-horizontal
        li
          nuxt-link(
            external
            to="https://github.com/awesome-comment/awesome-comment"
          )
            i.bi.bi-github
            | GitHub
        li
          nuxt-link(
            to="/admin"
          )
            i.bi.bi-list-check
            | Admin
</template>
