import { ResponseBody } from '@awesome-comment/core/types';
import { clearCache, getCacheKey } from '~/server/utils';
import { CommentStatus } from '@awesome-comment/core/data';
import createStorage from '@awesome-comment/core/utils/storage';

export default defineEventHandler(async function (event): Promise<ResponseBody<string>> {
  const id = event.context.params?.id;
  if (!id) {
    throw createError({
      statusCode: 404,
      message: 'Missing post id',
    });
  }

  try {
    const url = process.env.TIDB_END_POINT + '/v1/moderator/delete';
    const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
      }),
    });
    const json = await response.json();
    const isSuccess = json.data.result.row_affect === 1;
    if (!isSuccess) {
      throw createError({
        statusCode: 400,
        message: 'Delete failed',
      });
    }
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }

  // clear cache
  const status = Number(getHeader(event, 'X-AC-STATUS'));
  const postId = getHeader(event, 'X-AC-POST-ID');
  if (status === CommentStatus.Approved && postId) {
    const storage = createStorage(event);
    const key = getCacheKey(postId);
    await clearCache(storage, key);
  }

  return {
    code: 0,
    data: 'ok',
  };
});
