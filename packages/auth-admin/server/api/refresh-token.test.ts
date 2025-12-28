import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import refreshTokenHandler from './refresh-token';

type EnvKey = 'JWT_SECRET' | 'JWT_EXPIRATION' | 'KEY_PREFIX';

function setEnv(key: EnvKey, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

class FakeResponse {
  private readonly headers: Record<string, string | string[]> = {};

  getHeader(name: string): string | string[] | undefined {
    return this.headers[name.toLowerCase()];
  }

  setHeader(name: string, value: string | string[]): void {
    this.headers[name.toLowerCase()] = value;
  }

  removeHeader(name: string): void {
    delete this.headers[name.toLowerCase()];
  }

  appendHeader(name: string, value: string): void {
    const key = name.toLowerCase();
    const existing = this.headers[key];
    if (!existing) {
      this.headers[key] = value;
      return;
    }
    if (Array.isArray(existing)) {
      this.headers[key] = [ ...existing, value ];
      return;
    }
    this.headers[key] = [ existing, value ];
  }
}

function createEvent(options: {
  method?: string;
  payload?: unknown;
}): { event: H3Event; response: FakeResponse } {
  const response = new FakeResponse();
  const event = {
    node: {
      req: {
        method: options.method ?? 'POST',
        headers: {},
      },
      res: response,
    },
    context: {
      payload: options.payload,
    },
  } as unknown as H3Event;

  return { event, response };
}

describe('server/api/refresh-token', () => {
  const originalEnv: Partial<Record<EnvKey, string | undefined>> = {};

  beforeEach(() => {
    originalEnv.JWT_SECRET = process.env.JWT_SECRET;
    originalEnv.JWT_EXPIRATION = process.env.JWT_EXPIRATION;
    originalEnv.KEY_PREFIX = process.env.KEY_PREFIX;

    setEnv('JWT_SECRET', 'test-secret');
    setEnv('JWT_EXPIRATION', '1h');
    setEnv('KEY_PREFIX', 'aAuth');
  });

  afterEach(() => {
    setEnv('JWT_SECRET', originalEnv.JWT_SECRET);
    setEnv('JWT_EXPIRATION', originalEnv.JWT_EXPIRATION);
    setEnv('KEY_PREFIX', originalEnv.KEY_PREFIX);
  });

  it('非 POST 返回 405', async () => {
    const { event } = createEvent({ method: 'GET', payload: { sub: 'user-1' } });
    await expect(refreshTokenHandler(event)).rejects.toMatchObject({ statusCode: 405 });
  });

  it('payload 缺失返回 401', async () => {
    const { event } = createEvent({ method: 'POST' });
    await expect(refreshTokenHandler(event)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('成功签发新 token 并写入 cookie', async () => {
    const payload = {
      sub: 'user-1',
      email: 'a@b.com',
      picture: '',
      name: 'User',
      given_name: 'U',
      family_name: 'Ser',
      iat: 1,
      exp: 2,
    };
    const { event, response } = createEvent({ method: 'POST', payload });
    const result = await refreshTokenHandler(event);

    expect(result).toMatchObject({ code: 0 });
    if (result === '') {
      throw new Error('预期返回对象，但收到了空字符串');
    }
    const token = result.data?.token;
    expect(typeof token).toBe('string');
    if (typeof token !== 'string') return;

    const decoded = jwt.verify(token, 'test-secret') as unknown as { sub?: string };
    expect(decoded.sub).toBe('user-1');

    const cookie = response.getHeader('set-cookie');
    const cookieText = Array.isArray(cookie) ? cookie.join('; ') : cookie;
    expect(cookieText).toContain('aAuth-token=');
    expect(cookieText).toContain(token);
  });
});
