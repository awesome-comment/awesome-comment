import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono'
import { cors } from 'hono/cors';

const app = new Hono()
app.use('/comment/*', cors());

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.get('/comment/*', serveStatic({
  root: '../../packages/awesome-comment/dist',
  rewriteRequestPath(path: string) {
    return path.replace(/^\/comment/, '/');
  },
}));

const port = 3030
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
