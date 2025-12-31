import { Hono } from 'hono';
import type { Env } from '../utils';

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => {
  return c.text('ok');
});

app.options('/', (c) => {
  return c.text('0.1.0');
});

export default app;
