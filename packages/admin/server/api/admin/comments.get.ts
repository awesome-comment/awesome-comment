import digestFetch, { FetchError } from '@meathill/digest-fetch';
import { Comment, ResponseBody } from '@awesome-comment/core/types';

export default defineEventHandler(async function (event): Promise<ResponseBody<Comment[]>> {
  const query = getQuery(event);
  const {
    start = 0,
    status, // 0=to be reviewed, 1=approved
  } = query;

  const data: Comment[] = [];
  try {
    const url = 'https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/moderator/get';
    const params = new URLSearchParams();
    params.set('start', start as string);
    if (Array.isArray(status)) {
      status.forEach((item) => params.append('status', item));
    } else {
      params.append('status', status as string);
    }
    console.log('xxx', `${url}?${params}`);
    const response = await digestFetch(`${url}?${params}`, null, {
      method: 'GET',
      realm: 'tidb.cloud',
      username: process.env.TIDB_PUBLIC_KEY as string,
      password: process.env.TIDB_PRIVATE_KEY as string,
    });
    const result = await response.json();
    data.push(...result.data.rows);
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: (e as FetchError).status,
      message,
    });
  }

  return {
    code: 0,
    data,
  };
});
