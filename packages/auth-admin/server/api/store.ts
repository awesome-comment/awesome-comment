import { H3Event } from 'h3';
import type { AwesomeUser } from '@awesome-comment/core/types';
import { getUserStoreKey } from '~/server/utils';
import createStorage from '@awesome-comment/core/utils/storage';

export default defineEventHandler(async function (event: H3Event) {
  const method = event.node.req.method;
  if (method === 'OPTIONS') {
    return '';
  }

  if (method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed',
    });
  }

  const body = await readBody(event);
  const payload = event.context.payload as AwesomeUser;
  const { sub } = payload;
  const key = getUserStoreKey(sub);
  const storage = createStorage(event);
  const data = (await storage.get(key)) as Record<string, string>;
  data[body.key] = body.value;
  await storage.put(key, data);

  return {
    code: 0,
    data: 'ok',
  };
});
