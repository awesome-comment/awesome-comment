import digestFetch, { FetchError } from '@meathill/digest-fetch';
import { PostCount, ResponseBody } from '@awesome-comment/core/types';
import { getTidbKey } from '~/utils/tidb';

export default defineEventHandler(async function (event): Promise<ResponseBody<PostCount[]>> {
  const query = getQuery(event);
  const {
    start = 0,
  } = query;

  const data: PostCount[] = [];
  let total = 0;
  const kv = await getTidbKey();
  try {
    const url = 'https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/moderator/count_post';
    const response = await digestFetch(url, null, {
      method: 'GET',
      realm: 'tidb.cloud',
      ...kv,
    });
    const result = await response.json();
    total = result.data.rows[ 0 ].comment_count;
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: (e as FetchError).status,
      message,
    });
  }

  try {
    const url = 'https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/moderator/by_post';
    const params = new URLSearchParams();
    params.set('start', start as string);
    const response = await digestFetch(`${url}?${params}`, null, {
      method: 'GET',
      realm: 'tidb.cloud',
      ...kv,
    });
    const result = await response.json();
    data.push(...result.data.rows);
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: (e as FetchError).status,
      message,
    });
  }

  return {
    code: 0,
    data,
    meta: {
      total,
    },
  };
});
