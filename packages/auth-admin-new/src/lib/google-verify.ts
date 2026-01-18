import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export interface GooglePayload extends JWTPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

/**
 * 验证 Google ID Token
 * 使用 jose 库替代 google-auth-library，兼容 Cloudflare Workers 环境
 */
export async function verifyGoogleIdToken(idToken: string, clientId: string): Promise<GooglePayload> {
  const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: clientId,
  });

  if (!payload.sub) {
    throw new Error('ID token 缺少 sub');
  }

  return payload as GooglePayload;
}
