import digestFetch, { FetchError } from '@meathill/digest-fetch';
import { CommentStatus } from '@awesome-comment/core/data';
import { ResponseBody } from '@awesome-comment/core/types';
import { getTidbKey } from '~/server/utils/tidb';
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
    ? 'https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/moderator/patch'
    : 'https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/moderator/review';
  try {
    const kv = await getTidbKey();
    await digestFetch(url,
      {
        ...status !== undefined && { status },
        ...content && { content },
        id,
      },
      {
        method: 'POST',
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

  // clear cache
  if (body.status === CommentStatus.Approved && body.postId) {
    const storage = useStorage('data');
    const key = getCacheKey(body.postId);
    await clearCache(storage, key);
  }

  return {
    code: 0,
    data: 'ok',
  };
})
