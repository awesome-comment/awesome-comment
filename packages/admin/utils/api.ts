import { ResponseComment, User, AcConfig } from '@awesome-comment/core/types';
import digestFetch from '@meathill/digest-fetch';
import { getTidbKey } from './tidb';
import { H3Event } from 'h3';

export async function getConfig(): Promise<AcConfig> {
  const storage = useStorage('data');
  const key = getConfigKey();
  return (await storage.getItem(key)) as AcConfig;
}

export async function checkUserPermission(event: H3Event): Promise<[User, AcConfig] | void> {
  const config = await getConfig();
  // not configured, it's a new site
  if (!config) {
    return;
  }

  const authorization = getHeader(event, 'authorization');
  if (!authorization) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  let user: User | null = await getUser(authorization);
  try {
    user = await getUser(authorization);
  } catch (e) {
    const message =  (e as Error).message || e;
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

  if (!config.adminEmails.includes(user.email)) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }

  return [user, config];
}

export async function getUser(accessToken: string, domain?: string): Promise<User> {
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

export function getConfigKey(): string {
  return `${process.env.VERCEL_URL}_ac_config`;
}

export async function getUserComments(userId: string): Promise<ResponseComment[]> {
  const data: ResponseComment[] = [];
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
  return data;
}
