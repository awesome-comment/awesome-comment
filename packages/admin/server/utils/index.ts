import { H3Event } from 'h3';
import type { AcConfig, Comment, ResponseComment, User } from '@awesome-comment/core/types';
import { CommentStatus, MarkdownLinkRegex } from '@awesome-comment/core/data';
import { KVNamespace } from '@cloudflare/workers-types';

export async function getConfig(KV: KVNamespace): Promise<AcConfig> {
  const key = getConfigKey();
  return (await KV.get(key, { type: 'json' })) as AcConfig;
}

export async function checkUserPermission(event: H3Event): Promise<[User, AcConfig] | void> {
  const KV = event.context.cloudflare.env.KV;
  const config = await getConfig(KV);
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
    user = await getUser(KV, authorization);
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

export async function getUser(KV: KVNamespace, accessToken: string, domain?: string): Promise<User> {
  domain ??= process.env.AUTH0_DOMAIN || '';
  const key = `user-${domain}-${accessToken}`;
  const cached = await KV.get(key, { type: 'json' });
  if (cached) {
    return cached as User;
  }

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
  const user = (await response.json()) as User;
  await KV.put(key, JSON.stringify(user), {
    expirationTtl: 60 * 60,
  });
  return user;
}

export function getCacheKey(postId: string): string {
  return `comments-${postId}`;
}

export function getConfigKey(): string {
  return `${process.env.ADMIN_SITE}_ac_config`;
}

export async function getUserComments(userId: string): Promise<ResponseComment[]> {
  const data: ResponseComment[] = [];
  const url = process.env.TIDB_END_POINT + '/v1/user';
  const params = new URLSearchParams();
  params.set('user_id', userId as string);
  params.set('start', '0');
  // params.set('status', status.toString());
  const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
  const response = await fetch(`${url}?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${encodedCredentials}`,
    },
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

  // check if the comment should be auto approved
  if (isAutoApprove(config, comment.postId, history, comment.content)) {
    console.log(`user_id: ${userId} can post comment freely.`);
    return CommentStatus.Approved;
  }

  // if user has 5 or more pending comments in current postId,
  // or have pending comments in 10 postId,
  // they cannot post new comment
  const pendingForCurrentPost = history.filter(c =>
    c.post_id === comment.postId && c.status === CommentStatus.Pending);
  if (pendingForCurrentPost.length >= 5) {
    console.log(`user_id: ${userId} have 5 or more pending comments in this post_id, cannot post new comment.`);
    throw createError({
      statusCode: 405,
      message: 'You have 2 or more pending comments. Please wait for approval first.',
    });
  }
  const pendingPosts = history.reduce((acc, c) => {
    if (c.status !== CommentStatus.Pending) return acc;
    acc.add(c.post_id);
    return acc;
  }, new Set<string>());
  if (pendingPosts.size >= 10) {
    console.log(`user_id: ${userId} have pending comments in 10 or more posts, cannot post new comment.`);
    throw createError({
      statusCode: 405,
      message: 'You have pending comments in 10 or more posts. Please wait for approval first.',
    });
  }
  // if user has 5 or more rejected comments, they will be keep out until we give them a pass
  if (history.filter(c => Number(c.status) === CommentStatus.Rejected).length >= 5) {
    console.log(`user_id: ${userId} have 5 or more rejected comments, is banned currently.`);
    throw createError({
      statusCode: 405,
      message: 'You have too many rejected comments. You are not allowed to post comment.',
    });
  }

  return CommentStatus.Pending;
}

// if autoApprove is enabled, and current postId is included in autoApprove.include
// if user has 2 or more approved comments, they can post comment freely
export function isAutoApprove(
  config: AcConfig,
  postId: string,
  history: ResponseComment[],
  content: string,
): boolean {
  if (config.autoApprove && !config.autoApprove.enabled) return false;
  if (config.autoApprove?.include
    && !(new RegExp(config.autoApprove.include, 'i').test(postId))
  ) return false;
  if (config.autoApprove?.exclude
    && new RegExp(config.autoApprove.exclude, 'i').test(postId)
  ) return false;
  return !MarkdownLinkRegex.test(content)
    && history.filter(c => Number(c.status) === CommentStatus.Approved).length >= 2;
}

export async function clearCache(KV: KVNamespace, key: string): Promise<void> {
   const keys = await KV.list({
     prefix: key,
   });
 for (const k of keys.keys) {
   await KV.delete(k.name);
 }
}
