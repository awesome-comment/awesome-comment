import { Hono } from 'hono';
import type { AwesomeUser } from '@awesome-comment/core/types';
import type { Env } from '../utils';
import { getUserStoreKey } from '../utils';
import createStorage from '@awesome-comment/core/utils/storage';

type RetrieveRequestBody = {
  key?: string;
};

const app = new Hono<{ Bindings: Env }>();

app.post('/', async (c) => {
  const body = await c.req.json<RetrieveRequestBody>();
  const payload = c.get('payload') as AwesomeUser;
  const { sub } = payload;
  const key = getUserStoreKey(c.env, sub);

  // 创建一个兼容 H3Event 的对象来使用 storage
  const eventLike = {
    context: {
      cloudflare: {
        env: c.env,
      },
    },
  };

  const storage = createStorage(eventLike as never);
  const data = (await storage.get(key)) as Record<string, string>;

  return c.json({
    code: 0,
    data: (data && data[body.key || '']) || '',
  });
});

export default app;
