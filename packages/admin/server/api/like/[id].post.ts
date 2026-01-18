import type { ResponseBody, VoteItem } from '@awesome-comment/core/types';
import { H3Event } from 'h3';
import createStorage from '@awesome-comment/core/utils/storage';
import { getVoteCacheKey, requestTiDB } from '~/server/utils';

type PostResponse = ResponseBody<{
  like: number;
}>;
type LikeRequest = {
  like: boolean;
  postId: string;
};

export default defineEventHandler(async function (event: H3Event): Promise<PostResponse> {
  const headers = getHeaders(event);
  const ip = headers['x-real-ip'] || headers['x-forwarded-for'] || headers['x-client-ip'] || '';
  if (!ip) {
    throw createError({
      statusCode: 400,
      message: 'Invalid request',
    });
  }

  const id = event.context.params?.id;
  if (!id) {
    throw createError({
      statusCode: 404,
      message: 'Missing comment id',
    });
  }

  const body = (await readBody(event)) as LikeRequest;
  const { like, postId } = body;
  const storage = createStorage(event);
  const key = getVoteCacheKey(postId);
  const vote = (await storage.get<Record<string, VoteItem>>(key)) || {};
  const voteItem = vote[id];
  const now = Date.now();
  if (!voteItem) {
    const num = like ? 1 : 0;
    vote[id] = {
      like: num,
      dislike: 0,
      ip: {
        [ip]: [now],
      },
    };
    await storage.put(key, vote);
    await requestTiDB('/v1/like_comment', 'PUT', {
      id: Number(id),
      like: num,
    });
    return {
      code: 0,
      data: {
        like: num,
      },
    };
  }

  // check ip
  const ips = voteItem.ip[ip] || [];
  // find ip records in last 60s
  const index = ips.findIndex((t) => now - t < 60 * 1000); // 60s
  if (index > -1) {
    ips.splice(0, index);
  }
  if (ips.length > 20) {
    throw createError({
      statusCode: 400,
      message: 'Too many votes in a short time',
    });
  }

  // update vote
  voteItem.like = Math.max(voteItem.like + (like ? 1 : -1), 0);
  ips.push(now);
  await storage.put(key, vote);
  await requestTiDB('/v1/like_comment', 'PUT', {
    id: Number(id),
    like: voteItem.like,
  });
  return {
    code: 0,
    data: {
      like: voteItem.like,
    },
  };
});
