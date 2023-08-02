import digestFetch, { FetchError } from '@meathill/digest-fetch';
import { ResponseBody } from '@awesome-comment/core/types';
import { getTidbKey } from '~/utils/tidb';

export default defineEventHandler(async function (event): Promise<ResponseBody<string>> {
  const body = await readBody(event);
  if (!body.status) {
    throw createError({
      statusCode: 400,
      message: 'Status is required',
    });
  }
  const id = event.context.params?.id;

  try {
    const url = 'https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/moderator/review';
    const kv = await getTidbKey();
    await digestFetch(url,
      {
        status: body.status,
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

  return {
    code: 0,
    data: 'ok',
  };
})
