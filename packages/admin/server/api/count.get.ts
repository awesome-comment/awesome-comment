import digestFetch, { FetchError } from '@meathill/digest-fetch';
import { ResponseBody } from '@awesome-comment/core/types';
import { getTidbKey } from '~/server/utils/tidb';

export default defineCachedEventHandler(async function (event): Promise<ResponseBody<number>> {
  const query = getQuery(event);
  const { postId } = query;
  if (!postId) {
    throw createError({
      statusCode: 404,
      message: 'Missing post id',
    });
  }

  let num = 0;
  try {
    const url = process.env.TIDB_END_POINT + '/v1/count';
    const params = new URLSearchParams();
    params.set('post_id', postId as string);
    const kv = await getTidbKey();
    const response = await digestFetch(`${url}?${params}`, null, {
      method: 'GET',
      realm: 'tidb.cloud',
      ...kv,
    });
    const result = await response.json();
    num = result.data.rows[ 0 ].num;
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: (e as FetchError).status,
      message,
    });
  }

  return {
    code: 0,
    data: num,
  };
}, { maxAge: 60 * 20 });
