import { CommentStatus } from '@awesome-comment/core/data';
import { ResponseBody, User } from '@awesome-comment/core/types';
import { clearCache, getCacheKey, getUser } from '~/server/utils';
import createStorage from '@awesome-comment/core/utils/storage';

type PatchRequest = {
  status: CommentStatus;
  postId: string;
  comment: string;
  domain: string;
};

export default defineEventHandler(async function (event): Promise<ResponseBody<string>> {
  const headers = getHeaders(event);
  const authorization = headers[ 'authorization' ];
  if (!authorization) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const body = (await readBody(event)) as PatchRequest;
  const { comment } = body;
  const id = event.context.params?.id;
  if (!id) {
    throw createError({
      statusCode: 404,
      message: 'Missing post id',
    });
  }

  const storage = createStorage(event);
  let user: User | null = null;
  try {
    user = await getUser(storage, authorization, body.domain);
  } catch (e) {
    const message = (e as Error).message || e;
    throw createError({
      statusCode: 401,
      message: 'Failed to authorized user. ' + message,
    });
  }

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'User not found.',
    });
  }

  // user can only modify their own comments
  const url = process.env.TIDB_END_POINT + '/v1/patch';
  const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
  try {
    await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: comment,
        id,
        user_id: user.sub,
      }),
    });
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }

  // clear cache if the comment has been approved
  if (body.status === CommentStatus.Approved) {
    const key = getCacheKey(body.postId);
    await clearCache(storage, key);
  }

  return {
    code: 0,
    data: 'ok',
  };
})
