import { H3Event } from 'h3';
import {
  AcConfig,
  Comment,
  PostCommentRequest,
  ResponseBody,
  ResponseComment,
  ToggleableRule,
  User
} from '@awesome-comment/core/types';
import { CommentStatus, MarkdownLinkRegex, POST_INTERVAL } from '@awesome-comment/core/data';
import createStorage, { AcStorage } from '@awesome-comment/core/utils/storage';

export async function getConfig(storage: AcStorage): Promise<AcConfig> {
  const key = getConfigKey();
  return (await storage.get(key)) || {
    adminDisplayName: 'Admin',
    adminDisplayAvatar: '',
    adminEmails: process.env.DEFAULT_ADMIN_EMAILS?.split(',') || [],
    autoApprove: {
      enabled: false,
    },
    shortcutEmojis: [],
  } as AcConfig;
}

export async function checkUserPermission(event: H3Event, endpoint?: string): Promise<[User, AcConfig] | void> {
  const storage = createStorage(event);
  const config = await getConfig(storage);

  const authorization = getHeader(event, 'authorization');
  if (!authorization) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  let user: User | null = null;
  try {
    if (endpoint) {
      user = await getUser(storage, authorization, endpoint);
    } else {
      user = await getAuth0User(storage, authorization);
    }
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

export async function getUser(storage: AcStorage, accessToken: string, endpoint: string): Promise<User> {
  const key = `user-${accessToken}`;
  const cached = await storage.get(key);
  if (cached) {
    return cached as User;
  }

  const response = await fetch(`${endpoint}/verify-auth`, {
    method: 'POST',
    headers: {
      Authorization: accessToken,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  const json = (await response.json()) as ResponseBody<User>;
  const { data: user } = json;
  if (user) {
    await storage.put(key, user, {
      expirationTtl: 60 * 60,
    });
  }
  return user as User;
}

export async function getAuth0User(storage: AcStorage, accessToken: string, domain?: string): Promise<User> {
  domain ??= process.env.AUTH0_DOMAIN || '';
  const key = `user-${domain}-${accessToken}`;
  const cached = await storage.get(key);
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
  await storage.put(key, user, {
    expirationTtl: 60 * 60,
  });
  return user;
}

export function getCacheKey(postId: string): string {
  return `comments-${postId}`;
}

export function getVoteCacheKey(postId: string): string {
  return `vote-comment-${postId}`;
}

export function getConfigKey(): string {
  return `${process.env.ADMIN_SITE}_ac_config`;
}

export function getMyConfigKey(email: string): string {
  // generate a encrypted id by combining email and salt
  return `${process.env.ADMIN_SITE}_ac_config_${email}`;
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

export async function checkCommentStatus(userId: string, comment: PostCommentRequest, config: AcConfig): Promise<CommentStatus> {
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
  if (isAutoApprove(config, comment.postId, history, comment.comment)) {
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

export async function clearCache(storage: AcStorage, key: string): Promise<void> {
  const keys = await storage.list(key);
  for (const k of keys) {
    await storage.delete(k);
  }
}

export async function requestTiDB(
  url: string,
  method: string,
  body?: Record<string, unknown>,
  headers?: Record<string, string>,
): Promise<unknown> {
  const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
  const response = await fetch(process.env.TIDB_END_POINT + url, {
    method,
    headers: {
      'Authorization': `Basic ${encodedCredentials}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    ...body && { body: JSON.stringify(body) },
  });
  return await response.json();
}

export async function updateUserPostHistory(storage: AcStorage, accessToken: string, user: User): Promise<void> {
  const key = `user-${accessToken}`;
  const now = Date.now();
  const posts = (user.posts || []).filter(t => now - t < POST_INTERVAL);
  posts.push(now);
  await storage.put(key, {
    ...user,
    posts,
  }, {
    expirationTtl: 60 * 60,
  });
}
