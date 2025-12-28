import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  checkUserPermission,
  getJwtExpirationSeconds,
  getJwtSecret,
  getTokenCookieKey,
} from './index';

type EnvKey = 'JWT_SECRET' | 'JWT_EXPIRATION' | 'KEY_PREFIX';

function setEnv(key: EnvKey, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

describe('server/utils', () => {
  const originalEnv: Partial<Record<EnvKey, string | undefined>> = {};

  beforeEach(() => {
    originalEnv.JWT_SECRET = process.env.JWT_SECRET;
    originalEnv.JWT_EXPIRATION = process.env.JWT_EXPIRATION;
    originalEnv.KEY_PREFIX = process.env.KEY_PREFIX;
  });

  afterEach(() => {
    setEnv('JWT_SECRET', originalEnv.JWT_SECRET);
    setEnv('JWT_EXPIRATION', originalEnv.JWT_EXPIRATION);
    setEnv('KEY_PREFIX', originalEnv.KEY_PREFIX);
  });

  it('getJwtSecret：未配置时抛错', () => {
    setEnv('JWT_SECRET', undefined);
    expect(() => getJwtSecret()).toThrow('JWT_SECRET 未配置');
  });

  it('getJwtSecret：返回配置值', () => {
    setEnv('JWT_SECRET', 'test-secret');
    expect(getJwtSecret()).toBe('test-secret');
  });

  it('getTokenCookieKey：默认前缀', () => {
    setEnv('KEY_PREFIX', undefined);
    expect(getTokenCookieKey()).toBe('aAuth-token');
  });

  it('getTokenCookieKey：自定义前缀', () => {
    setEnv('KEY_PREFIX', 'myPrefix');
    expect(getTokenCookieKey()).toBe('myPrefix-token');
  });

  it('getJwtExpirationSeconds：默认 1h', () => {
    setEnv('JWT_EXPIRATION', undefined);
    expect(getJwtExpirationSeconds()).toBe(3600);
  });

  it('getJwtExpirationSeconds：支持秒数字符串', () => {
    setEnv('JWT_EXPIRATION', '7200');
    expect(getJwtExpirationSeconds()).toBe(7200);
  });

  it('getJwtExpirationSeconds：支持 10m/1.5h 等格式', () => {
    setEnv('JWT_EXPIRATION', '10m');
    expect(getJwtExpirationSeconds()).toBe(600);

    setEnv('JWT_EXPIRATION', '1.5h');
    expect(getJwtExpirationSeconds()).toBe(5400);
  });

  it('getJwtExpirationSeconds：非法格式抛错', () => {
    setEnv('JWT_EXPIRATION', 'abc');
    expect(() => getJwtExpirationSeconds()).toThrow('JWT_EXPIRATION 格式错误');
  });

  it('checkUserPermission：无 token 返回 null', () => {
    setEnv('JWT_SECRET', 'test-secret');
    const event = {
      node: {
        req: {
          headers: {},
        },
      },
    } as unknown as H3Event;

    expect(checkUserPermission(event)).toBeNull();
  });

  it('checkUserPermission：无效 token 返回 null', () => {
    setEnv('JWT_SECRET', 'test-secret');
    const event = {
      node: {
        req: {
          headers: {
            authorization: 'Bearer invalid',
          },
        },
      },
    } as unknown as H3Event;

    expect(checkUserPermission(event)).toBeNull();
  });

  it('checkUserPermission：有效 token 返回 payload', () => {
    setEnv('JWT_SECRET', 'test-secret');
    const token = jwt.sign({ sub: 'user-1', email: 'a@b.com' }, getJwtSecret());
    const event = {
      node: {
        req: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      },
    } as unknown as H3Event;

    const payload = checkUserPermission(event);
    expect(payload?.sub).toBe('user-1');
  });
});

