import type { Comment, ResponseBody } from '@awesome-comment/core/types';
import { H3Event } from 'h3';

export default defineEventHandler(async function (event: H3Event): Promise<ResponseBody<Comment[]>> {
  const query = getQuery(event);
  const { postId } = query;
  if (!postId) {
    throw createError({
      statusCode: 404,
      message: 'Missing post id',
    });
  }

  const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
  const data: Comment[] = [];
  const params = new URLSearchParams();
  params.set('post_id', postId as string);
  try {
    const url = process.env.TIDB_END_POINT + '/v1/comments_by_post_id';
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
  };
});
