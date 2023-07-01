<script setup lang="ts">

</script>

<template lang="pug">
form.mb-6
  .py-2.px-4.mb-4.bg-white.rounded-lg.rounded-t-lg.border.border-gray-200(
    class="dark:bg-gray-800 dark:border-gray-700"
  )
    label.sr-only(
      for="comment"
    ) Your comment
    textarea#comment.px-0.w-full.text-sm.text-gray-900.border-0(
      class="focus:ring-0 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:bg-gray-800"
      rows="6"
      placeholder="Write a comment..."
      required
    )
  button.inline-flex.items-center.px-4.text-xs.font-medium.text-center.text-white.bg-primary-700.rounded-lg(
    class="py-2.5 focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800"
    type="submit"
) Post comment
</template>

<script lang="ts">
export default {
  name: 'CommentForm',
}
</script>
