import digestFetch, { FetchError } from '@meathill/digest-fetch';
import { ResponseBody, StatDailyByLanguage } from '@awesome-comment/core/types';
import { getTidbKey } from '~/server/utils/tidb';

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
    const kv = await getTidbKey();
    const url = process.env.TIDB_END_POINT + '/v1/daily_stat_by_user';
    const response = await digestFetch(`${url}?${params}`, null, {
      method: 'GET',
      realm: 'tidb.cloud',
      ...kv,
    });
    const result = await response.json();
    rows.push(...result.data.rows);
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: (e as FetchError).status,
      message,
    });
  }

  return {
    code: 0,
    data: rows,
  };
});
