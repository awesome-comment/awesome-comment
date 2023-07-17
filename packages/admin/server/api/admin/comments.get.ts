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
    const url = `https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/admin/get?status=${status}&start=${start}`;
    const response = await digestFetch(url, null, {
      method: 'GET',
      realm: 'tidb.cloud',
      username: process.env.TIDB_PUBLIC_KEY,
      password: process.env.TIDB_PRIVATE_KEY,
    });
    console.log(response);
    const result = await response.json();
    data.push(...result.data.rows);
  } catch (e) {
    console.log('catch!!!')
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
