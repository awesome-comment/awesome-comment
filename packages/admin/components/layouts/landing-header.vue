<script setup lang="ts">

</script>

<template>
  <header class="navbar bg-base-200">
    <div class="container mx-auto flex items-center">
      <div class="flex-none">
        <nuxt-link
          class="btn btn-ghost normal-case text-xl"
          to="/"
        >
          Awesome Comment
        </nuxt-link>
      </div>
      <div class="flex-1">
        <ul class="menu menu-horizontal">
          <li>
            <nuxt-link
              to="/examples"
            >
              Examples
            </nuxt-link>
          </li>
        </ul>
      </div>

      <div class="flex-none">
        <ul class="menu menu-horizontal">
          <li>
            <nuxt-link
              external="external"
              to="https://github.com/awesome-comment/awesome-comment"
            >
              <i
                class="bi bi-github"
              />GitHub
            </nuxt-link>
          </li>
          <li>
            <nuxt-link to="/admin">
              <i class="bi bi-list-check" />Admin
            </nuxt-link>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>
