<script setup lang="ts">
const runtime = useRuntimeConfig();

useHead({
  script: [
    {
      src: runtime.public.repoUrl + '/awesome-comment.umd.js',
      crossorigin: 'anonymous',
      async: true,
    },
  ],
});

function initAwesomeComment(): void {
  if (!window.AwesomeComment) {
    setTimeout(initAwesomeComment, 100);
    return;
  }
  AwesomeComment.init(
    '#comment',
    'awesome-comment-self',
    '',
    runtime.public.auth0Domain,
    runtime.public.auth0ClientId,
  );
}
onMounted(initAwesomeComment);
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
    article.prose
      p.mb-4 First, embed the script in your page. It will load the latest version of the editor.
      pre.mb-4.whitespace-pre-wrap
        code &lt;script src="https://unpkg.com/@roudanio/awesome-comment@latest/dist/awesome-comment.umd.js"&gt;&lt;/script&gt;
      p.mb-4 Then, add the Comment component to your page. It will be rendered in the container element.
      pre.mb-4
        | AwesomeComment.init(
        |   dom, // container element, or DOM selector
        |   postId, // unique identifier for the page
        |   baseUrl, // base URL for the API
        |   domain, // auth0 domain
        |   clientId, // auth0 client id
        | );
      p.mb-4 Finally, you can use the editor in your page.
    #comment
</template>

<script lang="ts">
export default {
  name: 'HomepageIndex',
}
</script>
