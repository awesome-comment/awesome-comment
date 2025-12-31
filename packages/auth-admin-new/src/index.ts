import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './utils';
import { authMiddleware } from './middleware/auth';

// API routes
import googleAuth from './api/google-auth';
import health from './api/health';
import verifyAuth from './api/verify-auth';
import refreshToken from './api/refresh-token';
import store from './api/store';
import retrive from './api/retrive';

// 页面
import { indexPage } from './pages/index';

const app = new Hono<{ Bindings: Env }>();

// CORS 支持
app.use('*', cors());

// Auth 中间件
app.use('/api/*', authMiddleware);

// API 路由
app.route('/api/google-auth', googleAuth);
app.route('/api/health', health);
app.route('/api/verify-auth', verifyAuth);
app.route('/api/refresh-token', refreshToken);
app.route('/api/store', store);
app.route('/api/retrive', retrive);

// 首页文档
app.get('/', (c) => {
  return c.html(indexPage());
});

export default app;
