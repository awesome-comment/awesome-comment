import { H3Event } from 'h3';

export default defineEventHandler(async function (event: H3Event) {
  const header = getHeader(event, 'Authorization');
  if (header !== `Bearer ${process.env.CRON_SECRET}`) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const URLs = [
    process.env.TIDB_END_POINT + '/v1/cron/daily_stat',
    process.env.TIDB_END_POINT + '/cron/daily_stat_by_user',
  ];
  const requests = URLs.map(async url => {
    const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
      },
    });
    const json = await response.json();
    return [url, json.data.result.message];
  });
  const result = await Promise.all(requests);
  console.log('[Cron] ', result);
  return 'ok';
});
