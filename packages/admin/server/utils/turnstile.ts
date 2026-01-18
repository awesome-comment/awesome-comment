import { createError } from 'h3';
import type { PostCommentRequest, User } from '@awesome-comment/core/types';

type TurnstileVerifyResponse = {
  success: boolean;
  'error-codes'?: string[];
};

export async function verifyTurnstileToken(token: string, ip: string): Promise<void> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw createError({
      statusCode: 500,
      message: 'TURNSTILE_SECRET_KEY 未配置',
    });
  }

  const params = new URLSearchParams({
    secret,
    response: token,
  });
  if (ip) {
    params.set('remoteip', ip.split(',')[0].trim());
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  if (!response.ok) {
    throw createError({
      statusCode: 400,
      message: '验证码校验失败',
    });
  }
  const result = (await response.json()) as TurnstileVerifyResponse;
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: '验证码校验失败',
    });
  }
}

export async function buildAnonymousUser(
  body: PostCommentRequest,
  headers: Record<string, string>,
  ip: string,
): Promise<User> {
  const agent = headers['user-agent'] || '';
  const fingerprint = `${ip}|${agent}|${body.postId}|${body.domain}`;
  const hash = await hashAnonymousId(fingerprint);
  const sub = `anonymous:${hash}`;
  return {
    id: sub,
    sub,
    email: '',
    name: 'anonymous',
    nickname: 'anonymous',
    picture: '',
    avatar: '',
    agent,
    window: body.window,
    ip,
    custom: body.customData,
    extra: body.extraData,
  };
}

async function hashAnonymousId(value: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const data = new TextEncoder().encode(value);
    const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
    return bufferToHex(digest).slice(0, 32);
  }
  if (typeof btoa === 'function') {
    return btoa(value)
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 32);
  }
  return Buffer.from(value, 'utf-8')
    .toString('base64')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 32);
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
