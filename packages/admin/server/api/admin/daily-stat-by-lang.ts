import { ResponseBody, StatDailyByLanguage } from '@awesome-comment/core/types';

export default defineEventHandler(async function (event): Promise<ResponseBody<StatDailyByLanguage[]>> {
  const query = getQuery(event);
  const {
    start,
    end,
  } = query;

  const rows = [];
  const params = new URLSearchParams();
  params.set('start', start as string);
  params.set('end', end as string);
  try {
    const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
    const url = process.env.TIDB_END_POINT + '/v1/daily_stat';
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
});
