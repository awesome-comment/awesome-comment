import { createError, getHeader, type H3Event } from 'h3';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const DEFAULT_JWT_EXPIRATION_SECONDS = 60 * 60;
const JWT_ALGORITHM = 'HS256';

const UNIT_TO_SECONDS = {
  ms: 0.001,
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 24 * 60 * 60,
  w: 7 * 24 * 60 * 60,
  y: 365 * 24 * 60 * 60,
} as const;

type TimeUnit = keyof typeof UNIT_TO_SECONDS;

let lastJwtSecret: string | null = null;
let jwtSecretKey: Uint8Array | null = null;

function getJwtSecretKey(): Uint8Array {
  const secret = getJwtSecret();
  if (!jwtSecretKey || secret !== lastJwtSecret) {
    lastJwtSecret = secret;
    jwtSecretKey = new TextEncoder().encode(secret);
  }
  return jwtSecretKey;
}

export async function checkUserPermission(event: H3Event): Promise<JWTPayload | null> {
  const authorization = getHeader(event, 'authorization');
  const token = authorization?.split(' ')[ 1 ] || '';
  if (!token) return null;

  try {
    return await verifyJwt(token);
  } catch (e) {
    return null;
  }
}

export async function verifyJwt(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getJwtSecretKey(), { algorithms: [JWT_ALGORITHM] });
  return payload;
}

export async function signJwt(payload: JWTPayload): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expirationSeconds = getJwtExpirationSeconds();
  const expiresAt = issuedAt + expirationSeconds;

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM, typ: 'JWT' })
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAt)
    .sign(getJwtSecretKey());
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw createError({
      statusCode: 500,
      message: 'JWT_SECRET 未配置',
    });
  }
  return secret;
}

export function getJwtExpirationSeconds(): number {
  const raw = process.env.JWT_EXPIRATION;
  if (!raw) return DEFAULT_JWT_EXPIRATION_SECONDS;

  const trimmed = raw.trim();
  const seconds = Number(trimmed);
  if (Number.isFinite(seconds) && seconds > 0) {
    return seconds;
  }

  const match = trimmed.match(/^(\d+(?:\.\d+)?)(ms|s|m|h|d|w|y)$/i);
  if (!match) {
    throw createError({
      statusCode: 500,
      message: 'JWT_EXPIRATION 格式错误（支持：秒数，或 10m/1h/7d 等）',
    });
  }

  const amountText = match[ 1 ];
  const unitText = match[ 2 ];
  if (!amountText || !unitText) {
    throw createError({
      statusCode: 500,
      message: 'JWT_EXPIRATION 格式错误（支持：秒数，或 10m/1h/7d 等）',
    });
  }

  const amount = Number(amountText);
  if (!Number.isFinite(amount)) {
    throw createError({
      statusCode: 500,
      message: 'JWT_EXPIRATION 格式错误（支持：秒数，或 10m/1h/7d 等）',
    });
  }
  const unit = unitText.toLowerCase() as TimeUnit;
  const value = Math.round(amount * UNIT_TO_SECONDS[ unit ]);
  return Math.max(1, value);
}

export function getTokenCookieKey(): string {
  return `${process.env.KEY_PREFIX || 'aAuth'}-token`;
}

export function getUserStoreKey(userId: string): string {
  return `${process.env.KEY_PREFIX || 'aAuth'}-user-${userId}`;
}
