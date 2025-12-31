import { createMiddleware } from 'hono/factory';
import type { Env } from '../utils';
import { checkUserPermission } from '../utils';
import { HTTPException } from 'hono/http-exception';

declare module 'hono' {
  interface ContextVariableMap {
    payload: Record<string, unknown> | null;
  }
}

export const authMiddleware = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const path = new URL(c.req.url).pathname;

    // 跳过公开路由
    if (path.endsWith('/google-auth') || path.endsWith('/health')) {
      return next();
    }

    const payload = await checkUserPermission(c);
    c.set('payload', payload);

    if (!payload) {
      // verify-auth 允许未登录访问，返回 null payload
      if (path.endsWith('/verify-auth')) {
        return next();
      }

      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    return next();
  }
);
