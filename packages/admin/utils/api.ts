import { ResponseComment, User } from '@awesome-comment/core/types';
// import { CommentStatus } from '@awesome-comment/core/data';
import digestFetch, { FetchError } from '@meathill/digest-fetch';
import { getTidbKey } from './tidb';

export async function getUser(accessToken: string, domain: string): Promise<User> {
  domain ??= process.env.AUTH0_DOMAIN || '';
  const response = await fetch(
    `https://${domain}/userinfo`,
    {
      headers: {
        Authorization: accessToken,
        'Content-Type': 'application/json',
      },
    },
  );
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return await response.json();
}

export function getCacheKey(postId: string): string {
  return `comments-${postId}`;
}

export async function getUserComments(userId: string): Promise<ResponseComment[]> {
  const data: ResponseComment[] = [];
  try {
    const url = 'https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/user';
    const params = new URLSearchParams();
    params.set('user_id', userId as string);
    params.set('start', '0');
    // params.set('status', status.toString());
    const kv = await getTidbKey();
    const response = await digestFetch(`${url}?${params}`, null, {
      method: 'GET',
      realm: 'tidb.cloud',
      ...kv,
    });
    const result = await response.json();
    data.push(...result.data.rows);
  } catch (e) {
    const message = (e as Error).message || String(e);
    console.error(message);
  }
  return data;
}
