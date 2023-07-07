<script setup lang="ts">
const runtime = useRuntimeConfig();
onMounted(() => {
  if (!window.AwesomeComment) return;
  AwesomeComment.init(
    '#comment',
    '/',
    runtime.public.auth0Domain,
    runtime.public.auth0ClientId,
  );
});
</script>

<template lang="pug">
main.container.mx-auto.py-8.flex.gap-4
  .flex-none(class="w-1/2")
    h2.text-2xl.font-bold
      i.bi.bi-speedometer2.mr-2
      | Dashboard

    h2.text-xl.font-bold
      i.bi.bi-people.mr-2
      | Users

    h2.text-xl.font-bold
      i.bi.bi-newspaper.mr-2
      | News

  .flex-1.h-full
    p.mb-4 First, embed the script in your page. It will load the latest version of the editor.
    .mockup-code.mb-4
      pre.whitespace-pre-wrap
        code &lt;script src="https://unpkg.com/@roudanio/awesome-comment@0.1.0/dist/awesome-comment.umd.cjs"&gt;&lt;/script&gt;
    p.mb-4 Then, add the Comment component to your page. It will be rendered in the container element.
    .mockup-code.mb-4
      pre
        code AwesomeComment.init(dom, baseUrl, domain, clientId);
    p.mb-4 Finally, you can use the editor in your page.
    #comment
</template>

<script lang="ts">
export default {
  name: 'HomepageIndex',
}
</script>
