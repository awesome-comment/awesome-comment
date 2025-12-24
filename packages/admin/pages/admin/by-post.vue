<script setup lang="ts">
import type { PostCount, ResponseBody } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { useAdminAuth } from '../../composables/use-admin-auth';

const page = ref<number>(1);
const message = ref<string>('');
const adminAuth = useAdminAuth();

const { data, pending, refresh } = useLazyAsyncData<{list: PostCount[], total: number}>(
  'count',
  async function () {
    const empty = { list: [], total: 0 };
    if (!adminAuth.isAuthenticated.value) {
      message.value = 'Sorry, you must login first.'
      return empty;
    }

    try {
      const { data, meta } = await $fetch<ResponseBody<PostCount[]>>('/api/admin/count-by-post', {
        params: {
          start: (page.value - 1) * 20,
        },
        headers: await adminAuth.buildHeaders(),
      });
      return { list: data, total: meta.total };
    } catch (error) {
      message.value = 'Failed to get comments count. ' + error.message;
      return empty;
    }
  },
  {
    default() {
      return {
        list: [],
        total: 0,
      };
    },
    watch: [page],
  },
);

useHead({
  title: 'Comments by Posts',
});

definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  name: 'posts',
});
</script>

<template>
  <header class="flex mb-4 gap-4 items-center">
    <h1 class="text-2xl font-bold">
      By Posts
    </h1>
    <span
      v-if="pending"
      class="loading loading-spinner"
    />
  </header>
  <p
    v-if="message"
    class="alert alert-error mb-4"
  >
    <i class="bi bi-x-circle" />
    <span>{{ message }}</span>
  </p>
  <div class="overflow-x-auto mb-4">
    <table class="table table-pin-cols table-pin-rows">
      <thead>
        <tr>
          <th>Post ID</th>
          <th>Comment Count</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in data.list"
          :key="item.post_id"
        >
          <td>
            <nuxt-link
              class="link link-info hover:no-underline"
              external
              target="_blank"
              :to="item.post_id"
            >
              {{ item.post_id }}
            </nuxt-link>
            <i class="bi bi-box-arrow-up-right text-info ms-2" />
          </td>
          <td>
            <nuxt-link
              class="link link-info hover:no-underline"
              :to="`/admin/comments?post_id=${ item.post_id }&status=${CommentStatus.Approved}`"
            >
              {{ item.comment_count }}
            </nuxt-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <u-pagination
    v-model="page"
    :page-count="20"
    :total="data.total"
  />
</template>
