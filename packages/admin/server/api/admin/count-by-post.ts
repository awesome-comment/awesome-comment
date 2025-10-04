import { PostCount, ResponseBody } from '@awesome-comment/core/types';

export default defineEventHandler(async function (event): Promise<ResponseBody<PostCount[]>> {
  const query = getQuery(event);
  const {
    start = 0,
  } = query;

  const data: PostCount[] = [];
  let total = 0;
  const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
  try {
    const url = process.env.TIDB_END_POINT + '/v1/moderator/count_post';
    const response = await fetch(url, {
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
