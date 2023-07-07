<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template lang="pug">
footer.bg-neutral.text-neutral-content.mt-auto
  .container.mx-auto.footer.items-center.p-4
    .items-center.grid-flow-col
      img.w-8.h-8.object-cover.rounded-full.mr-1(src="https://evereditor.com/mui2.jpg", alt="")
      p Copyright © {{year}} - All right reserved

    .grid-flow-col.gap-4(class="md:place-self-center md:justify-self-end")
      nuxt-link.text-2xl(
        to="https://twitter.com/meathill1"
      )
        i.bi.bi-twitter
      nuxt-link.text-2xl(
        to="https://facebook.com/meathill"
      )
        i.bi.bi-meta
      nuxt-link.text-2xl(
        to="https://www.youtube.com/channel/UCBeD-XqErDK4tKy5FtZj8vg"
      )
        i.bi.bi-youtube
</template>
