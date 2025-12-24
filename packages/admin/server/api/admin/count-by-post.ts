import { PostCount, ResponseBody } from '@awesome-comment/core/types';
import { getSiteIdFromEvent } from '../../utils';

export default defineEventHandler(async function (event): Promise<ResponseBody<PostCount[]>> {
  const query = getQuery(event);
  const {
    start = 0,
  } = query;

  const data: PostCount[] = [];
  let total = 0;
  const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
  const siteId = getSiteIdFromEvent(event);
  const postIdPrefix = siteId ? `${siteId}:%` : '';
  try {
    const url = process.env.TIDB_END_POINT + '/v1/moderator/count_post';
    const params = new URLSearchParams();
    if (postIdPrefix) {
      params.set('post_id_prefix', postIdPrefix);
    }
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    total = Number(result.data.rows[ 0 ].comment_count);
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }

  try {
    const url = process.env.TIDB_END_POINT + '/v1/moderator/by_post';
    const params = new URLSearchParams();
    params.set('start', start as string);
    if (postIdPrefix) {
      params.set('post_id_prefix', postIdPrefix);
    }
    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
      },
    });
    const result = await response.json();
    data.push(...result.data.rows);
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
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
