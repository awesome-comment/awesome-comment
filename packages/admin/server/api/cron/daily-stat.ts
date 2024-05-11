import digestFetch from '@meathill/digest-fetch';
import { H3Event } from 'h3';
import { getTidbKey } from '~/server/utils/tidb';

export default defineEventHandler(async function (event: H3Event) {
  const header = getHeader(event, 'Authorization');
  if (header !== `Bearer ${process.env.CRON_SECRET}`) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const url = 'https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/cron/daily_stat';
  const kv = await getTidbKey();
  const response = await digestFetch(url, {}, {
    method: 'POST',
    realm: 'tidb.cloud',
    ...kv,
  });
  const json = await response.json();
  console.log('[Cron] ', json.data.result.message);
  return 'ok';
});
