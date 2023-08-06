<template lang="pug">
main.container.mx-auto.py-4
  h2.text-3xl.font-bold.mb-4 Examples
  .grid.grid-cols-4.gap-4
    nuxt-link.bg-base-200.flex.flex-col.justify-center.items-center.h-32.rounded(
      class="hover:bg-primary/10 hover:shadow"
      to="/examples/preload"
    )
      h3.text-2xl.font-bold.mb-4 Preload
      p Create comment after preload, no CLS
</template>

<script lang="ts">
export default {
  name: 'ExamplesIndex'
}
</script>
