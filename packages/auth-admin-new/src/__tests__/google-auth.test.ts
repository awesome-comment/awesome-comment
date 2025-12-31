import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { jwtVerify } from 'jose';
import type { Env } from '../utils';

type EnvKey = 'JWT_SECRET' | 'JWT_EXPIRATION' | 'KEY_PREFIX' | 'GOOGLE_CLIENT_ID';

const mockEnv: Record<EnvKey, string | undefined> = {
  JWT_SECRET: 'test-secret',
  JWT_EXPIRATION: '1h',
  KEY_PREFIX: 'aAuth',
  GOOGLE_CLIENT_ID: 'google-client-id',
};

let verifyGoogleIdTokenMock: Mock;

vi.mock('../lib/google-verify', () => ({
  verifyGoogleIdToken: vi.fn((...args: unknown[]) => verifyGoogleIdTokenMock(...args)),
}));

describe('src/api/google-auth', () => {
  beforeEach(() => {
    verifyGoogleIdTokenMock = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('缺少 credential 返回 400', async () => {
    const { default: googleAuthApp } = await import('../api/google-auth');

    // Hono 子路由使用根路径 '/'
    const request = new Request('http://localhost/', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await googleAuthApp.fetch(request, mockEnv as unknown as Env);
    expect(response.status).toBe(400);
  });

  it('缺少 GOOGLE_CLIENT_ID 返回 500', async () => {
    const { default: googleAuthApp } = await import('../api/google-auth');
    const envWithoutClientId = { ...mockEnv, GOOGLE_CLIENT_ID: undefined };

    const request = new Request('http://localhost/', {
      method: 'POST',
      body: JSON.stringify({ credential: 'x' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await googleAuthApp.fetch(
      request,
      envWithoutClientId as unknown as Env
    );
    expect(response.status).toBe(500);
  });

  it('verifyGoogleIdToken 抛出异常时返回 400', async () => {
    verifyGoogleIdTokenMock.mockRejectedValue(new Error('Invalid token'));

    const { default: googleAuthApp } = await import('../api/google-auth');

    const request = new Request('http://localhost/', {
      method: 'POST',
      body: JSON.stringify({ credential: 'invalid-token' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await googleAuthApp.fetch(request, mockEnv as unknown as Env);
    expect(response.status).toBe(400);
  });

  it('成功签发 JWT', async () => {
    verifyGoogleIdTokenMock.mockResolvedValue({
      sub: 'user-1',
      email: 'a@b.com',
      picture: '',
      name: 'User',
      given_name: 'U',
      family_name: 'Ser',
    });

    const { default: googleAuthApp } = await import('../api/google-auth');

    const request = new Request('http://localhost/', {
      method: 'POST',
      body: JSON.stringify({ credential: 'google-id-token' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await googleAuthApp.fetch(request, mockEnv as unknown as Env);
    expect(response.status).toBe(200);

    const result = (await response.json()) as { code: number; data: { token: string } };
    expect(result.code).toBe(0);
    expect(typeof result.data?.token).toBe('string');

    // 验证签发的 JWT
    const secretKey = new TextEncoder().encode('test-secret');
    const { payload: decoded } = await jwtVerify(result.data.token, secretKey, {
      algorithms: ['HS256'],
    });
    expect(decoded.sub).toBe('user-1');
  });
});

