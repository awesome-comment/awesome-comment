<script setup lang="ts">
import type { ResponseBody, StatDailyByUser } from '@awesome-comment/core/types';
import { useAuth0 } from '@auth0/auth0-vue';
import dayjs from 'dayjs';

const auth0 = process.client && useAuth0();
const route = useRoute();
const router = useRouter();
const yesterday = dayjs().subtract(1, 'd');
const startDate = yesterday.subtract(30, 'd');

const message = ref<string>('');
const start = ref<number>(0);
const { data, pending, refresh } = useLazyAsyncData<StatDailyByUser[]>(
  'daily-stat-by-user',
  async function () {
    const empty = [] as StatDailyByUser[];
    if (!auth0) return empty;
    if (!auth0.isAuthenticated.value) {
      message.value = 'Sorry, you must login first.'
      return empty;
    }

    const token = await auth0.getAccessTokenSilently();
    try {
      const { data } = await $fetch<ResponseBody<StatDailyByUser[]>>('/api/daily-stat-by-user', {
        params: {
          start: start.value,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return (data || []).map(item => {
        return {
          ...item,
          userInfo: JSON.parse(item.user_info),
          from: item.user_id.split('|')[ 0 ],
        };
      });
    } catch (error) {
      message.value = 'Failed to get comments count. ' + error.message;
      return empty;
    }
  },
  {
    watch: [start],
  },
);

useHead({
  title: 'Daily Stat by User',
});
definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  name: 'daily-stat-by-user',
});
</script>

<template>
  <header class="flex mb-4 gap-4 items-center">
    <h1 class="text-2xl font-bold">
      Daily Stat by User
    </h1>
    <span
      v-if="pending"
      class="loading loading-spinner"
    />
    <div class="ms-auto">
      Stat period: {{ startDate.format('YYYY-MM-DD') }} - {{ yesterday.format('YYYY-MM-DD') }}
    </div>
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
          <th>User</th>
          <th>Posts</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in data"
          :key="item.user_id"
        >
          <td>
            <user-cell
              :from="item.from"
              prefix="/admin/comments"
              :user="item.userInfo"
              :user-id="item.user_id"
            />
          </td>
          <td>
            {{ item.posts }}
          </td>
          <td>
            {{ item.total }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
