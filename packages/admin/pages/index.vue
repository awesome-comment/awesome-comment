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
main.container.mx-auto.py-8.flex.flex-col.gap-4.px-4(class="sm:flex-row sm:px-0")
  .flex-none(class="sm:w-1/2")
    .hero.bg-base-200.rounded.mb-4
      .hero-content.py-6
        div
          h1.text-5xl.font-bold.text-center
            | Awesome Comment
          p.text-lg.py-6.text-center
            | A cloud native comment system for every sites.
            br
            | It's free and open source. You can fully control all your data.
            br
            | Thanks for Open Source Community.

          h2.text-2xl.font-bold.mb-4.text-center Contributors
          .flex.flex-col.gap-4.justify-center(class="sm:flex-row")
            .bg-base-100.rounded-box.flex.gap-2.p-2.items-center.border(class="sm:w-56")
              .avatar
                .w-16.rounded-full
                  img(
                    src="https://evereditor.com/mui2.jpg"
                    alt="Meathill Zhai"
                  )
              .flex-1
                nuxt-link.link.link-primay.font-bold.block(
                  class="hover:no-underline"
                  external
                  to="https://github.com/meathill"
                ) Meathill Zhai
                p
                  nuxt-link.btn.btn-sm.btn-circle.btn-ghost(
                    external
                    to="https://twitter.com/meathill1"
                  )
                    i.bi.bi-twitter
                  nuxt-link.btn.btn-sm.btn-circle.btn-ghost(
                    to="https://blog.meathill.com/"
                  )
                    i.bi.bi-rss
            .bg-base-100.rounded-box.flex.gap-2.p-2.items-center.border(class="sm:w-56")
              .avatar
                .w-16.rounded-full
                  img(
                    src="https://avatars.githubusercontent.com/u/14840170?v=4"
                    alt="Bambooom"
                  )
              .flex-1
                nuxt-link.link.link-primay.font-bold.block(
                  class="hover:no-underline"
                  external
                  to="https://github.com/bambooom"
                ) Bamboo
            .bg-base-100.rounded-box.flex.gap-2.p-2.items-center.border(class="sm:w-56")
              .avatar
                  i.bi.bi-patch-question.text-5xl.w-16.h-16.text-center.leading-16
              .flex-1
                .font-bold.block Mystery boss

    .mb-4.grid(class="sm:grid-cols-3")
      nuxt-link.p-4.border.rounded-t-box.text-center(
        class="hover:border-primary hover:bg-primary/10 sm:rounded-tr-none sm:rounded-l-box"
        to="/examples"
      )
        i.bi.bi-code.mr-2
        | Examples
      nuxt-link.p-4.border-x.text-center(
        class="hover:border-primary hover:bg-primary/10 sm:border-y sm:border-x-0"
        to="https://github.com/meathill/awesome-comment/issues"
      )
        i.bi.bi-record-circle.mr-2
        | Issues
      nuxt-link.p-4.border.rounded-b-box.text-center(
        class="hover:border-primary hover:bg-primary/10 sm:rounded-bl-none sm:rounded-r-box"
        to="https://paypal.me/meathill?country.x=C2&locale.x=zh_XC"
      )
        i.bi.bi-heart-fill.mr-2
        | Support us


    h2.text-2xl.font-bold.mb-4
      i.bi.bi-newspaper.mr-2
      | News
    .bg-base-200.py-4.mb-4.text-center.text-sm(class="text-neutral/20") (WIP)

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
