import digestFetch, { FetchError } from '@meathill/digest-fetch';
import { Comment, ResponseBody } from '@awesome-comment/core/types';
import {start} from "repl";

export default defineEventHandler(async function (event): Promise<ResponseBody<Comment[]>> {
  const query = getQuery(event);
  const {
    start = 0,
    postId,
  } = query;

  const data: Comment[] = [];
  try {
    const url = `https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/get?post_id=${postId}&start=${start}`;
    const response = await digestFetch(url, null, {
      method: 'GET',
      realm: 'tidb.cloud',
      username: process.env.TIDB_PUBLIC_KEY,
      password: process.env.TIDB_PRIVATE_KEY,
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