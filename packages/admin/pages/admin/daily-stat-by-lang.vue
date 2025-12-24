<script setup lang="ts">
import dayjs from 'dayjs';
import { DatePicker } from 'v-calendar';
import type { ResponseBody, StatDailyByLanguage } from '@awesome-comment/core/types';
import 'v-calendar/dist/style.css';
import type { DatePickerRangeObject } from 'v-calendar/dist/types/src/use/datePicker';
import { useAdminAuth } from '../../composables/use-admin-auth';

const adminAuth = useAdminAuth();
const route = useRoute();
const router = useRouter();

const message = ref<string>('');
const endDate = route.params.end ? dayjs(route.params.end) : dayjs().subtract(1, 'day');
const startDate = endDate.subtract(7, 'day');
const range = ref<DatePickerRangeObject>({
  start: startDate.toDate(),
  end: endDate.toDate(),
});
const { data, pending, refresh } = useLazyAsyncData<StatDailyByLanguage[]>(
  'daily-stat',
  async function () {
    const empty = [] as StatDailyByLanguage[];
    if (!adminAuth.isAuthenticated.value) {
      message.value = 'Sorry, you must login first.'
      return empty;
    }

    try {
      const { data } = await $fetch<ResponseBody<StatDailyByLanguage[]>>('/api/admin/daily-stat-by-lang', {
        params: dateRange.value,
        headers: await adminAuth.buildHeaders(),
      });
      return data;
    } catch (error) {
      message.value = 'Failed to get comments count. ' + error.message;
      return empty;
    }
  },
  {
    default() {
      return [] as StatDailyByLanguage[];
    },
    watch: [range],
  },
);
const dateRange = computed<DatePickerRangeObject>(() => {
  return {
    start: (range.value.start as Date).toISOString().substring(0, 10),
    end: (range.value.end as Date).toISOString().substring(0, 10),
  }
});
const languages = computed<string[]>(() => {
  if (!data.value) return [];

  const set = new Set();
  for (const item of data.value) {
    set.add(item.lang);
  }
  return Array.from(set);
})
const stats = computed<Record<string, Record<string, number>>>(() => {
  if (!data.value) return {};

  const stats: Record<string, Record<string, number>> = {};
  for (const item of data.value) {
    const dateStat: Record<string, number> = stats[ item.date ] || {};
    dateStat[ item.lang ] = Number(item.total);
    dateStat.total = (dateStat.total || 0) + Number(item.total);
    stats[ item.date ] = dateStat;
  }
  const dates = Object.keys(stats).sort((a: string, b: string) => b > a ? 1 : -1);
  const result: Record<string, Record<string, number>> = {};
  for (const date of dates) {
    result[ date ] = stats[ date ];
  }
  return result;
});

function onDateRangeChange(value: DatePickerRangeObject) {
  router.push({
    query: dateRange.value,
  });
}

useHead({
  title: 'Daily Stat by Language',
});
definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  name: 'daily-stat-by-lang',
});
</script>

<template>
  <header class="flex mb-4 gap-4 items-center">
    <h1 class="text-2xl font-bold">
      Daily Stat by Language
    </h1>
    <span
      v-if="pending"
      class="loading loading-spinner"
    />
    <date-picker
      v-model.range="range"
      mode="date"
      :popover="{
        visibility: 'focus',
      }"
      @update:model-value="onDateRangeChange"
    >
      <template #default="{ inputValue, inputEvents }">
        <div class="flex justify-center items-center gap-4 ms-auto">
          <input
            class="input input-bordered input-sm"
            readonly
            :value="inputValue.start"
            v-on="inputEvents.start"
          >
          <i class="bi bi-arrow-right" />
          <input
            class="input input-bordered input-sm"
            readonly
            :value="inputValue.end"
            v-on="inputEvents.end"
          >
        </div>
      </template>
    </date-picker>
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
          <th>Date</th>
          <th
            v-for="lang in languages"
            :key="lang"
            class="uppercase"
          >
            <nuxt-link
              class="link link-info hover:no-underline"
              :to="`/admin/comments?status=all&language=${lang}`"
            >
              {{ lang }}
            </nuxt-link>
          </th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, date) in stats"
          :key="date"
        >
          <td>{{ date }}</td>
          <td
            v-for="lang in languages"
            :key="lang"
          >
            {{ item[lang] || 0 }}
          </td>
          <td>
            {{ item.total }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
