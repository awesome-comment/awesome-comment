import digestFetch, { FetchError } from '@meathill/digest-fetch';
import { CommentStatus } from '@awesome-comment/core/data';
import { ResponseBody, User } from '@awesome-comment/core/types';
import { getTidbKey } from '~/utils/tidb';
import { getCacheKey, getUser } from '~/utils/api';

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

  let user: User | null = null;
  try {
    user = await getUser(authorization, body.domain);
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

  const url = 'https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/patch';
  try {
    const kv = await getTidbKey();
    await digestFetch(url,
      {
        content: comment,
        id,
        user_id: user.sub,
      },
      {
        method: 'PUT',
        realm: 'tidb.cloud',
        ...kv,
      },
    );
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: (e as FetchError).status,
      message,
    });
  }

  // clear cache if the comment has been approved
  if (body.status === CommentStatus.Approved) {
    const storage = useStorage('data');
    const key = getCacheKey(body.postId);
    await storage.removeItem(key);
  }

  return {
    code: 0,
    data: 'ok',
  };
})
