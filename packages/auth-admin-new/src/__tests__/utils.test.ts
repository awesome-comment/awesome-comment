import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { Env } from '../utils';

describe('src/utils', () => {
  const originalEnv: Partial<Record<string, string | undefined>> = {};

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getJwtExpirationSeconds', () => {
    it('默认返回 3600 秒', async () => {
      const { getJwtExpirationSeconds } = await import('../utils');
      const env = {} as Env;
      expect(getJwtExpirationSeconds(env)).toBe(3600);
    });

    it('支持纯秒数', async () => {
      const { getJwtExpirationSeconds } = await import('../utils');
      const env = { JWT_EXPIRATION: '7200' } as unknown as Env;
      expect(getJwtExpirationSeconds(env)).toBe(7200);
    });

    it('支持时间单位格式', async () => {
      const { getJwtExpirationSeconds } = await import('../utils');

      expect(getJwtExpirationSeconds({ JWT_EXPIRATION: '1h' } as unknown as Env)).toBe(3600);
      expect(getJwtExpirationSeconds({ JWT_EXPIRATION: '30m' } as unknown as Env)).toBe(1800);
      expect(getJwtExpirationSeconds({ JWT_EXPIRATION: '7d' } as unknown as Env)).toBe(604800);
      expect(getJwtExpirationSeconds({ JWT_EXPIRATION: '1w' } as unknown as Env)).toBe(604800);
    });

    it('格式错误时抛出异常', async () => {
      const { getJwtExpirationSeconds } = await import('../utils');
      const env = { JWT_EXPIRATION: 'invalid' } as unknown as Env;
      expect(() => getJwtExpirationSeconds(env)).toThrow();
    });
  });

  describe('getTokenCookieKey', () => {
    it('使用默认前缀', async () => {
      const { getTokenCookieKey } = await import('../utils');
      const env = {} as Env;
      expect(getTokenCookieKey(env)).toBe('aAuth-token');
    });

    it('使用自定义前缀', async () => {
      const { getTokenCookieKey } = await import('../utils');
      const env = { KEY_PREFIX: 'myApp' } as unknown as Env;
      expect(getTokenCookieKey(env)).toBe('myApp-token');
    });
  });

  describe('getUserStoreKey', () => {
    it('生成正确的存储键', async () => {
      const { getUserStoreKey } = await import('../utils');
      const env = { KEY_PREFIX: 'test' } as unknown as Env;
      expect(getUserStoreKey(env, 'user-123')).toBe('test-user-user-123');
    });
  });

  describe('signJwt / verifyJwt', () => {
    it('签发并验证 JWT', async () => {
      const { signJwt, verifyJwt } = await import('../utils');
      const env = { JWT_SECRET: 'test-secret-key' } as Env;

      const payload = { sub: 'user-1', name: 'Test User' };
      const token = await signJwt(payload, env);

      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);

      const decoded = await verifyJwt(token, env);
      expect(decoded.sub).toBe('user-1');
      expect(decoded.name).toBe('Test User');
    });
  });
});
