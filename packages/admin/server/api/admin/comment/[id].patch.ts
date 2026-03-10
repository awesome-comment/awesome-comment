import { CommentStatus } from '@awesome-comment/core/data';
import { ResponseBody } from '@awesome-comment/core/types';
import { clearCache, getCacheKey } from '~/server/utils';
import createStorage from '@awesome-comment/core/utils/storage';

type PatchRequest = {
  status?: CommentStatus;
  content?: string;
  postId?: string;
  isShadowBanned?: boolean;
};

export default defineEventHandler(async function (event): Promise<ResponseBody<string>> {
  const body = (await readBody(event)) as PatchRequest;
  const { status, content, isShadowBanned } = body;
  if (status === undefined && content === undefined && isShadowBanned === undefined) {
    throw createError({
      statusCode: 400,
      message: 'Invalid body',
    });
  }
  const id = Number(event.context.params?.id);
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid comment id',
    });
  }

  let url = process.env.TIDB_END_POINT + '/v1/moderator/review';
  let method = 'POST';
  let requestBody: Record<string, unknown> = { id };

  if (content !== undefined) {
    url = process.env.TIDB_END_POINT + '/v1/moderator/patch';
    requestBody.content = content;
  } else if (isShadowBanned !== undefined) {
    url = process.env.TIDB_END_POINT + '/v1/moderator/ban';
    method = 'PUT';
    requestBody.banned = isShadowBanned ? 1 : 0;
  } else if (status !== undefined) {
    requestBody.status = status;
  }

  try {
    const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update: ${response.statusText}`);
    }
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }

  // clear cache
  if ((status === CommentStatus.Approved || isShadowBanned !== undefined) && body.postId) {
    const storage = createStorage(event);
    const key = getCacheKey(body.postId);
    await clearCache(storage, key);
  }

  return {
    code: 0,
    data: 'ok',
  };
});
