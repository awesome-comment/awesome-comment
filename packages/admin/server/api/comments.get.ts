import type { AcConfig, Comment, ResponseBody, VoteItem } from '@awesome-comment/core/types';
import { getCacheKey, getConfig, getVoteCacheKey } from '~/server/utils';
import { H3Event } from 'h3';
import createStorage from '@awesome-comment/core/utils/storage';

function mergeVote(vote: Record<number, VoteItem>, comments: Comment[]): Comment[] {
  return comments.map((item) => {
    const voteItem = vote?.[item.id as number];
    if (voteItem) {
      item.like = voteItem.like;
    }
    return item;
  });
}

export default defineEventHandler(async function (event: H3Event): Promise<ResponseBody<Comment[]>> {
  const query = getQuery(event);
  const { postId } = query;
  const start = Number(query.start || 0);
  if (!postId) {
    throw createError({
      statusCode: 404,
      message: 'Missing post id',
    });
  }

  const storage = createStorage(event);
  const key = getCacheKey(postId + (start ? '-' + start : ''));
  const stored = await storage.get<Comment[]>(key);
  const voteKey = getVoteCacheKey(postId as string);
  const vote = (await storage.get<Record<number, VoteItem>>(voteKey)) || {};
  if (stored) {
    console.log('[cache] get comments from cache: ', key);
    // TODO remove this compatibility code after the next release
    const data = ('data' in stored ? stored.data : stored) as Comment[];
    const total = ('total' in stored ? stored.total : (data as unknown[]).length) as number;
    return {
      code: 0,
      data: mergeVote(vote, data),
      meta: {
        total,
      },
    };
  }

  const data: Comment[] = [];
  let total = 0;
  const params = new URLSearchParams();
  params.set('post_id', postId as string);
  params.set('start', start.toString());
  const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
  try {
    const url = process.env.TIDB_END_POINT + '/v1/get';
    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
      },
    });
    const result = await response.json();
    data.push(...result.data.rows);

    const config = (await getConfig(storage)) as AcConfig;
    const { adminEmails = [], adminDisplayName = '', adminDisplayAvatar = '' } = config || {};
    for (const item of data) {
      if (!item.user) continue;
      item.user = JSON.parse(String(item.user));
      item.isAdmin = adminEmails.includes(item.user?.email || '');
      if (item.isAdmin && item.user) {
        item.user.avatar = adminDisplayAvatar || item.user.avatar;
        item.user.name = adminDisplayName || item.user.name;
      }
    }
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }
  try {
    const url = process.env.TIDB_END_POINT + '/v1/count';
    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
      },
    });
    const json = await response.json();
    total = Number(json.data.rows[0].num);
  } catch (e) {
    const message = 'Failed to fetch the quantity of comments. ' + (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }

  await storage.put(key, { data, total });
  return {
    code: 0,
    data: mergeVote(vote, data),
    meta: {
      total,
    },
  };
});
