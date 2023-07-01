<script setup lang="ts">

</script>

<template lang="pug">
article.p-6.mb-6.text-base.bg-white.rounded-lg(
  class="dark:bg-gray-900"
)
  footer.flex.justify-between.items-center.mb-2
    .flex.items-center
      p.inline-flex.items-center.mr-3.text-sm.text-gray-900(
        class="dark:text-white"
      )
        img.mr-2.w-6.h-6.rounded-full(
          src="https://flowbite.com/docs/images/people/profile-picture-2.jpg"
          alt="Michael Gough"
        )
        | Michael Gough
      p.text-sm.text-gray-600(
        class="dark:text-gray-400"
      )
        time(
          pubdate
          datetime="2022-02-08"
          title="February 8th, 2022"
        ) Feb. 8, 2022
    button#dropdownComment1Button.inline-flex.items-center.p-2.text-sm.font-medium.text-center.text-gray-400.bg-white.rounded-lg(
      class="hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      data-dropdown-toggle="dropdownComment1"
      type="button"
    )
      svg.w-5.h-5(
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      )
        path(
          d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"
        ) undefined
      span.sr-only Comment settings
    //  Dropdown menu
    #dropdownComment1.hidden.z-10.w-36.bg-white.rounded.divide-y.divide-gray-100.shadow(
      class="dark:bg-gray-700 dark:divide-gray-600"
    )
      ul.py-1.text-sm.text-gray-700(
        class="dark:text-gray-200"
        aria-labelledby="dropdownMenuIconHorizontalButton"
      )
        li
          a.block.py-2.px-4(
            class="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            href="#"
          ) Edit
        li
          a.block.py-2.px-4(
            class="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            href="#"
          ) Remove
        li
          a.block.py-2.px-4(
            class="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            href="#"
          ) Report
  p.text-gray-500(
    class="dark:text-gray-400"
  ) Very straight-to-point article. Really worth time reading. Thank you! But tools are just the instruments for the UX designers. The knowledge of the design tools are as important as the creation of the design strategy.
  .flex.items-center.mt-4.space-x-4
    button.flex.items-center.text-sm.text-gray-500(
      class="hover:underline dark:text-gray-400"
      type="button"
    )
      svg.mr-1.w-4.h-4(
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      )
        path(
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        )
      | Reply
article.p-6.mb-6.ml-6.text-base.bg-white.rounded-lg(
  class="lg:ml-12 dark:bg-gray-900"
)
  footer.flex.justify-between.items-center.mb-2
    .flex.items-center
      p.inline-flex.items-center.mr-3.text-sm.text-gray-900(
        class="dark:text-white"
      )
        img.mr-2.w-6.h-6.rounded-full(
          src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
          alt="Jese Leos"
        )
        | Jese Leos
      p.text-sm.text-gray-600(
        class="dark:text-gray-400"
      )
        time(
          pubdate
          datetime="2022-02-12"
          title="February 12th, 2022"
        ) Feb. 12, 2022
    button#dropdownComment2Button.inline-flex.items-center.p-2.text-sm.font-medium.text-center.text-gray-400.bg-white.rounded-lg(
      class="hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      data-dropdown-toggle="dropdownComment2"
      type="button"
    )
      svg.w-5.h-5(
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      )
        path(
          d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"
        ) undefined
      span.sr-only Comment settings
    //  Dropdown menu
    #dropdownComment2.hidden.z-10.w-36.bg-white.rounded.divide-y.divide-gray-100.shadow(
      class="dark:bg-gray-700 dark:divide-gray-600"
    )
      ul.py-1.text-sm.text-gray-700(
        class="dark:text-gray-200"
        aria-labelledby="dropdownMenuIconHorizontalButton"
      )
        li
          a.block.py-2.px-4(
            class="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            href="#"
          ) Edit
        li
          a.block.py-2.px-4(
            class="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            href="#"
          ) Remove
        li
          a.block.py-2.px-4(
            class="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            href="#"
          ) Report
  p.text-gray-500(
    class="dark:text-gray-400"
  ) Much appreciated! Glad you liked it ☺️
  .flex.items-center.mt-4.space-x-4
    button.flex.items-center.text-sm.text-gray-500(
      class="hover:underline dark:text-gray-400"
      type="button"
    )
      svg.mr-1.w-4.h-4(
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      )
        path(
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        )
      | Reply
article.p-6.mb-6.text-base.bg-white.border-t.border-gray-200(
  class="dark:border-gray-700 dark:bg-gray-900"
)
  footer.flex.justify-between.items-center.mb-2
    .flex.items-center
      p.inline-flex.items-center.mr-3.text-sm.text-gray-900(
        class="dark:text-white"
      )
        img.mr-2.w-6.h-6.rounded-full(
          src="https://flowbite.com/docs/images/people/profile-picture-3.jpg"
          alt="Bonnie Green"
        )
        | Bonnie Green
      p.text-sm.text-gray-600(
        class="dark:text-gray-400"
      )
        time(
          pubdate
          datetime="2022-03-12"
          title="March 12th, 2022"
        ) Mar. 12, 2022
    button#dropdownComment3Button.inline-flex.items-center.p-2.text-sm.font-medium.text-center.text-gray-400.bg-white.rounded-lg(
      class="hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      data-dropdown-toggle="dropdownComment3"
      type="button"
    )
      svg.w-5.h-5(
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      )
        path(
          d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"
        ) undefined
      span.sr-only Comment settings
    //  Dropdown menu
    #dropdownComment3.hidden.z-10.w-36.bg-white.rounded.divide-y.divide-gray-100.shadow(
      class="dark:bg-gray-700 dark:divide-gray-600"
    )
      ul.py-1.text-sm.text-gray-700(
        class="dark:text-gray-200"
        aria-labelledby="dropdownMenuIconHorizontalButton"
      )
        li
          a.block.py-2.px-4(
            class="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            href="#"
          ) Edit
        li
          a.block.py-2.px-4(
            class="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            href="#"
          ) Remove
        li
          a.block.py-2.px-4(
            class="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            href="#"
          ) Report
  p.text-gray-500(
    class="dark:text-gray-400"
  ) The article covers the essentials, challenges, myths and stages the UX designer should consider while creating the design strategy.
  .flex.items-center.mt-4.space-x-4
    button.flex.items-center.text-sm.text-gray-500(
      class="hover:underline dark:text-gray-400"
      type="button"
    )
      svg.mr-1.w-4.h-4(
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      )
        path(
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        )
      | Reply
article.p-6.text-base.bg-white.border-t.border-gray-200(
  class="dark:border-gray-700 dark:bg-gray-900"
)
  footer.flex.justify-between.items-center.mb-2
    .flex.items-center
      p.inline-flex.items-center.mr-3.text-sm.text-gray-900(
        class="dark:text-white"
      )
        img.mr-2.w-6.h-6.rounded-full(
          src="https://flowbite.com/docs/images/people/profile-picture-4.jpg"
          alt="Helene Engels"
        )
        | Helene Engels
      p.text-sm.text-gray-600(
        class="dark:text-gray-400"
      )
        time(
          pubdate
          datetime="2022-06-23"
          title="June 23rd, 2022"
        ) Jun. 23, 2022
    button#dropdownComment4Button.inline-flex.items-center.p-2.text-sm.font-medium.text-center.text-gray-400.bg-white.rounded-lg(
      class="hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      data-dropdown-toggle="dropdownComment4"
      type="button"
    )
      svg.w-5.h-5(
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      )
        path(
          d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"
        ) undefined
    //  Dropdown menu
    #dropdownComment4.hidden.z-10.w-36.bg-white.rounded.divide-y.divide-gray-100.shadow(
      class="dark:bg-gray-700 dark:divide-gray-600"
    )
      ul.py-1.text-sm.text-gray-700(
        class="dark:text-gray-200"
        aria-labelledby="dropdownMenuIconHorizontalButton"
      )
        li
          a.block.py-2.px-4(
            class="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            href="#"
          ) Edit
        li
          a.block.py-2.px-4(
            class="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            href="#"
          ) Remove
        li
          a.block.py-2.px-4(
            class="hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            href="#"
          ) Report
  p.text-gray-500(
    class="dark:text-gray-400"
  ) Thanks for sharing this. I do came from the Backend development and explored some of the tools to design my Side Projects.
  .flex.items-center.mt-4.space-x-4
    button.flex.items-center.text-sm.text-gray-500(
      class="hover:underline dark:text-gray-400"
      type="button"
    )
      svg.mr-1.w-4.h-4(
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      )
        path(
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        )
      | Reply
</template>

<script lang="ts">
export default {
  name: 'CommentSections',
}
</script>
