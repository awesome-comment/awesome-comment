import { Hono } from 'hono';
import type { Env } from '../utils';

const app = new Hono<{ Bindings: Env }>();

app.post('/', (c) => {
  const payload = c.get('payload');
  return c.json({
    code: 0,
    data: payload,
  });
});

export default app;
