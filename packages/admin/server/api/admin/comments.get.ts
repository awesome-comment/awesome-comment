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
    let url = `https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/moderator/get?start=${start}&`;
    if (Array.isArray(status)) {
      const st = status.map(s => `status=${s}`).join('&');
      url += st;
    } else {
      url += `status=${status}`;
    }
    const response = await digestFetch(url, null, {
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