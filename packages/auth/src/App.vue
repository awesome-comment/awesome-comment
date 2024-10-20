<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { AwesomeAuth, AwesomeAuthEvent, getInstance } from './auth.ts';
import { JwtPayload } from 'jwt-decode';

let awesomeAuth: AwesomeAuth;
const commentWrapper = ref<HTMLDivElement>();
const user = ref<JwtPayload>();
const isVerified = ref<boolean>(false);

onMounted(async () => {
  awesomeAuth = getInstance({
    googleId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    root: import.meta.env.VITE_AUTH_URI,
  });
  awesomeAuth.on(AwesomeAuthEvent.VERIFIED, (result: boolean) => {
    isVerified.value = result;
    if (result) {
      user.value = awesomeAuth.user;
    } else {
      user.value = undefined;
    }
  });
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `${import.meta.env.VITE_AWESOME_COMMENT_HOST}/comment/style.css`;
  document.head.appendChild(link);
  const commentModule = await import(`${import.meta.env.VITE_AWESOME_COMMENT_HOST}/comment/awesome-comment.js`);
  const comment = commentModule.default;
  comment.init(commentWrapper.value, {
    postId: 'awesome-comment-self',
    apiUrl: 'http://localhost:3000',
    awesomeAuth,
  });
});
</script>

<template>
  <div class="container mx-auto">
    <h1 class="text-2xl font-semibold mb-6 py-4 border-b">
      Awesome Auth
    </h1>
    <div class="grid grid-cols-2 grid-rows-2 gap-4 auto-rows-min">
      <div class="border rounded-md pt-2 px-4 pb-4">
        <h2 class="text-lg mb-2">
          Auth status
        </h2>
        <div class="">
          {{ isVerified ? 'Verified' : 'Not verified' }}
        </div>
      </div>
      <div class="border rounded-md pt-2 px-4 pb-4 col-start-1 row-start-2">
        <h2 class="text-lg mb-2">
          Auth data
        </h2>
        <div class="bg-gray-50 min-h-4">
          <pre
            v-if="isVerified"
            class="whitespace-pre-wrap text-wrap break-all px-4 py-2"
          >{{ JSON.stringify(user, null, '  ') }}</pre>
        </div>
      </div>
      <div
        ref="commentWrapper"
        class="border rounded-md p-4 col-start-2 row-span-2"
      />
    </div>
  </div>
</template>
