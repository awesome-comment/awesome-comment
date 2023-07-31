import digestFetch, { FetchError } from '@meathill/digest-fetch';
import { ResponseBody } from '@awesome-comment/core/types';

export default defineEventHandler(async function (event): Promise<ResponseBody<string>> {
  const id = event.context.params?.id;

  try {
    const url = 'https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/moderator/delete';
    const response = await digestFetch(url,
      {
        id,
      },
      {
        method: 'POST',
        realm: 'tidb.cloud',
        username: process.env.TIDB_PUBLIC_KEY as string,
        password: process.env.TIDB_PRIVATE_KEY as string,
      },
    );
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
      statusCode: (e as FetchError).status,
      message,
    });
  }

  return {
    code: 0,
    data: 'ok',
  };
})