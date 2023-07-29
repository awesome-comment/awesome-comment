import digestFetch, { FetchError } from '@meathill/digest-fetch';
import { Comment, ResponseBody, User } from '@awesome-comment/core/types';
import { getUser } from '~/utils/api';

export default defineEventHandler(async function (event): Promise<ResponseBody<Comment[]>> {
  const query = getQuery(event);
  const {
    start = 0,
    postId,
    domain = '',
  } = query;
  const headers = getHeaders(event);
  const authorization = headers[ 'authorization' ];
  let user: User | null = null;
  if (authorization && domain) {
    try {
      user = await getUser(authorization, domain as string);
    } catch (e) {
      const message = (e as Error).message || e;
      // just log it
      console.error('Failed to get user. ' + message);
    }
  }

  const data: Comment[] = [];
  try {
    const url = `https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/get?post_id=${postId}&start=${start}`;
    const params = new URLSearchParams();
    params.set('post_id', postId as string);
    params.set('start', start as string);
    if (user) {
      params.set('user_id', user.sub);
    }
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
