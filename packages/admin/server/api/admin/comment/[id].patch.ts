import { CommentStatus } from '@awesome-comment/core/data';
import { ResponseBody } from '@awesome-comment/core/types';
import { clearCache, getCacheKey } from '~/server/utils';

type PatchRequest = {
  status?: CommentStatus;
  content?: string;
  postId?: string;
};

export default defineEventHandler(async function (event): Promise<ResponseBody<string>> {
  const body = (await readBody(event)) as PatchRequest;
  const { status, content } = body;
  if (!status && !content) {
    throw createError({
      statusCode: 400,
      message: 'Invalided body',
    });
  }
  const id = event.context.params?.id;
  if (!id) {
    throw createError({
      statusCode: 404,
      message: 'Missing post id',
    });
  }

  const url = body.content
    ? process.env.TIDB_END_POINT + '/v1/moderator/patch'
    : process.env.TIDB_END_POINT + '/v1/moderator/review';
  try {
    const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...status !== undefined && { status },
        ...content && { content },
        id,
      }),
    });
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }

  // clear cache
  if (body.status === CommentStatus.Approved && body.postId) {
    const key = getCacheKey(body.postId);
    await clearCache(key);
  }

  return {
    code: 0,
    data: 'ok',
  };
})
