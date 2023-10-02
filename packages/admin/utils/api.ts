import { Comment, ResponseComment, User, AcConfig } from '@awesome-comment/core/types';
import digestFetch from '@meathill/digest-fetch';
import { getTidbKey } from './tidb';
import { H3Event } from 'h3';
import { CommentStatus } from '@awesome-comment/core/data';

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

  let user: User | null = null;
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
  return `${process.env.ADMIN_SITE}_ac_config`;
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

export async function checkCommentStatus(userId: string, comment: Comment, config: AcConfig): Promise<CommentStatus> {
  const history = await getUserComments(userId);
  if (!history.length) return CommentStatus.Pending;

  const lastCommentTime = new Date(history[ 0 ].created_at);
  // users can only post once every 30 seconds
  if (Date.now() - lastCommentTime.getTime() < 3e4) {
    throw createError({
      statusCode: 500,
      message: 'You can post comment once in 30 seconds.',
    });
  }

  // if user has 2 or more pending comments, they cannot post new comment
  if (isAutoApprove(config, comment.postId, history)) {
    console.log(`user_id: ${userId} can post comment freely.`);
    return CommentStatus.Approved;
  }

  if (history.filter(c => Number(c.status) === CommentStatus.Pending).length >= 2) {
    console.log(`user_id: ${userId} have 2 or more pending comments, cannot post new comment.`);
    throw createError({
      statusCode: 405,
      message: 'You have 2 or more pending comments. Please wait for approval first.',
    });
  } else if (history.filter(c => Number(c.status) === CommentStatus.Rejected).length >= 5) {
    // if user has 5 or more rejected comments, they will be keep out until we give them a pass
    console.log(`user_id: ${userId} have 5 or more rejected comments, is banned currently.`);
    throw createError({
      statusCode: 405,
      message: 'You have too many rejected comments. You are not allowed to post comment.',
    });
  }

  return CommentStatus.Pending;
}

// if user has 2 or more approved comments, they can post comment freely
export function isAutoApprove(config: AcConfig, postId: string, history: ResponseComment[]): boolean {
  if (config.autoApprove && !config.autoApprove.enabled) return false;
  if (config.autoApprove?.include
    && !(new RegExp(config.autoApprove.include, 'i').test(postId))
  ) return false;
  if (config.autoApprove?.exclude
    && new RegExp(config.autoApprove.exclude, 'i').test(postId)
  ) return false;
  return history.filter(c => Number(c.status) === CommentStatus.Approved).length >= 2;
}
