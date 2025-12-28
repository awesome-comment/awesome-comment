import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type EnvKey = 'JWT_SECRET' | 'JWT_EXPIRATION' | 'KEY_PREFIX' | 'GOOGLE_CLIENT_ID';

function setEnv(key: EnvKey, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

let verifyIdTokenMock: ReturnType<typeof vi.fn>;

vi.mock('google-auth-library', () => {
  return {
    OAuth2Client: class OAuth2Client {
      constructor(_clientId?: string) {}

      verifyIdToken(options: unknown): unknown {
        return (verifyIdTokenMock as unknown as (options: unknown) => unknown)(options);
      }
    },
  };
});

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
  body?: unknown;
}): { event: H3Event; response: FakeResponse } {
  const response = new FakeResponse();
  const method = options.method ?? 'POST';
  const headers: Record<string, string> = {};
  let bodyText: string | undefined;

  if (options.body !== undefined) {
    headers['content-type'] = 'application/json';
    bodyText = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  const event = {
    method,
    node: {
      req: {
        method,
        headers,
        ...(bodyText ? { body: bodyText } : {}),
      },
      res: response,
    },
    context: {},
  } as unknown as H3Event;

  return { event, response };
}

describe('server/api/google-auth', () => {
  const originalEnv: Partial<Record<EnvKey, string | undefined>> = {};

  beforeEach(() => {
    verifyIdTokenMock = vi.fn();

    originalEnv.JWT_SECRET = process.env.JWT_SECRET;
    originalEnv.JWT_EXPIRATION = process.env.JWT_EXPIRATION;
    originalEnv.KEY_PREFIX = process.env.KEY_PREFIX;
    originalEnv.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

    setEnv('JWT_SECRET', 'test-secret');
    setEnv('JWT_EXPIRATION', '1h');
    setEnv('KEY_PREFIX', 'aAuth');
    setEnv('GOOGLE_CLIENT_ID', 'google-client-id');
  });

  afterEach(() => {
    setEnv('JWT_SECRET', originalEnv.JWT_SECRET);
    setEnv('JWT_EXPIRATION', originalEnv.JWT_EXPIRATION);
    setEnv('KEY_PREFIX', originalEnv.KEY_PREFIX);
    setEnv('GOOGLE_CLIENT_ID', originalEnv.GOOGLE_CLIENT_ID);
  });

  it('非 POST 返回 405', async () => {
    const { default: googleAuthHandler } = await import('./google-auth');
    const { event } = createEvent({ method: 'GET', body: { credential: 'x' } });
    await expect(googleAuthHandler(event)).rejects.toMatchObject({ statusCode: 405 });
  });

  it('缺少 credential 返回 400', async () => {
    const { default: googleAuthHandler } = await import('./google-auth');
    const { event } = createEvent({ method: 'POST', body: {} });
    await expect(googleAuthHandler(event)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('缺少 GOOGLE_CLIENT_ID 返回 500', async () => {
    setEnv('GOOGLE_CLIENT_ID', undefined);

    const { default: googleAuthHandler } = await import('./google-auth');
    const { event } = createEvent({ method: 'POST', body: { credential: 'x' } });
    await expect(googleAuthHandler(event)).rejects.toMatchObject({ statusCode: 500 });
  });

  it('verifyIdToken 返回空 payload 时返回 400', async () => {
    verifyIdTokenMock.mockResolvedValue({
      getPayload() {
        return null;
      },
    });

    const { default: googleAuthHandler } = await import('./google-auth');
    const { event } = createEvent({ method: 'POST', body: { credential: 'x' } });
    await expect(googleAuthHandler(event)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('payload 缺少 sub 时返回 400', async () => {
    verifyIdTokenMock.mockResolvedValue({
      getPayload() {
        return { email: 'a@b.com' };
      },
    });

    const { default: googleAuthHandler } = await import('./google-auth');
    const { event } = createEvent({ method: 'POST', body: { credential: 'x' } });
    await expect(googleAuthHandler(event)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('成功签发 JWT 并写入 cookie', async () => {
    verifyIdTokenMock.mockResolvedValue({
      getPayload() {
        return {
          sub: 'user-1',
          email: 'a@b.com',
          picture: '',
          name: 'User',
          given_name: 'U',
          family_name: 'Ser',
        };
      },
    });

    const { default: googleAuthHandler } = await import('./google-auth');
    const { event, response } = createEvent({ method: 'POST', body: { credential: 'google-id-token' } });
    const result = await googleAuthHandler(event);

    expect(result).toMatchObject({ code: 0 });
    if (result === '') {
      throw new Error('预期返回对象，但收到了空字符串');
    }
    const token = result.data?.token;
    expect(typeof token).toBe('string');
    if (typeof token !== 'string') return;

    const decoded = jwt.verify(token, 'test-secret') as unknown as { sub?: string };
    expect(decoded.sub).toBe('user-1');

    expect(verifyIdTokenMock).toHaveBeenCalledWith({
      idToken: 'google-id-token',
      audience: 'google-client-id',
    });

    const cookie = response.getHeader('set-cookie');
    const cookieText = Array.isArray(cookie) ? cookie.join('; ') : cookie;
    expect(cookieText).toContain('aAuth-token=');
    expect(cookieText).toContain(token);
  });
});
