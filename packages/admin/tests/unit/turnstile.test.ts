import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { PostCommentRequest } from '@awesome-comment/core/types';
import { buildAnonymousUser, verifyTurnstileToken } from '../../server/utils/turnstile';

describe('Turnstile Utils', () => {
  const originalFetch = globalThis.fetch;
  const originalSecret = process.env.TURNSTILE_SECRET_KEY;

  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = 'test-secret';
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    process.env.TURNSTILE_SECRET_KEY = originalSecret;
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('校验成功时不抛错', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await expect(verifyTurnstileToken('token', '1.2.3.4')).resolves.toBeUndefined();
  });

  it('校验失败时抛错', async () => {
    (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false }),
    });

    await expect(verifyTurnstileToken('token', '1.2.3.4')).rejects.toBeTruthy();
  });

  it('缺少密钥时抛错', async () => {
    process.env.TURNSTILE_SECRET_KEY = '';
    await expect(verifyTurnstileToken('token', '1.2.3.4')).rejects.toBeTruthy();
  });

  it('构建匿名用户信息', async () => {
    const body: PostCommentRequest = {
      postId: 'post-1',
      comment: 'hello',
      domain: 'example.com',
      customData: { foo: 'bar' },
      extraData: 'extra',
    };
    const user = await buildAnonymousUser(body, { 'user-agent': 'ua-test' }, '1.2.3.4');

    expect(user.name).toBe('anonymous');
    expect(user.nickname).toBe('anonymous');
    expect(user.sub.startsWith('anonymous:')).toBe(true);
    expect(user.custom).toEqual({ foo: 'bar' });
    expect(user.extra).toBe('extra');
    expect(user.ip).toBe('1.2.3.4');
  });
});
