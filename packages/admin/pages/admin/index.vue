<script setup lang="ts">
const message = ref<string>('');

const { data, pending } = await useFetch('/api/admin/comments', {
  query: {
    status: 0,
    start: 0,
  },
  default() {
    return [];
  }
})

console.log(data);
</script>

<template lang="pug">
main.container.mx-auto.py-8
  header.flex.items-center
    h1.text-2xl.font-bold Pending Comments
</template>

<script lang="ts">
export default {
  name: 'AdminIndexPage',
}
</script>
