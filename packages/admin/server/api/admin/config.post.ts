import { ResponseBody } from '@awesome-comment/core/types';
import { H3Event } from 'h3';
import { getConfigKey } from '~/server/utils';
import { Redis } from '@upstash/redis/cloudflare';

export default defineEventHandler(async function (event: H3Event): Promise<ResponseBody<string>> {
  const body = await readBody(event);

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  });
  const key = getConfigKey();
  const {
    adminEmails,
    autoApprove,
  } = body;
  await redis.set(key, {
    adminEmails,
    autoApprove,
  });

  return {
    code: 0,
    data: 'ok',
  };
});
