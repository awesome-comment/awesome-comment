import { ResponseBody, StatDailyByLanguage } from '@awesome-comment/core/types';
import dayjs from 'dayjs';

export default defineCachedEventHandler(async function (event): Promise<ResponseBody<StatDailyByLanguage[]>> {
  const query = getQuery(event) as { start: number, date: string };
  const {
    start = 0,
    date,
  } = query;

  const rows = [];
  const params = new URLSearchParams();
  params.set('start', start.toString());
  params.set('date', date || dayjs().subtract(1, 'd').format('YYYY-MM-DD'));
  try {
    const url = process.env.TIDB_END_POINT + '/v1/daily_stat_by_user';
    const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
      },
    });
    const result = await response.json();
    rows.push(...result.data.rows);
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }

  return {
    code: 0,
    data: rows,
  };
}, { maxAge: 60 * 60 });
