import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { setCookie } from 'hono/cookie';
import type { Env } from '../utils';
import { signJwt, getTokenCookieKey } from '../utils';
import { verifyGoogleIdToken } from '../lib/google-verify';

type GoogleAuthRequestBody = {
  credential?: string;
};

const app = new Hono<{ Bindings: Env }>();

app.post('/', async (c) => {
  const body = await c.req.json<GoogleAuthRequestBody>();
  const credential = body.credential;

  if (!credential) {
    throw new HTTPException(400, { message: '缺少 credential' });
  }

  const googleClientId = c.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    throw new HTTPException(500, { message: 'GOOGLE_CLIENT_ID 未配置' });
  }

  let payload;
  try {
    payload = await verifyGoogleIdToken(credential, googleClientId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to verify ID token';
    throw new HTTPException(400, { message });
  }

  const { sub, email, picture, name, given_name, family_name } = payload;

  if (!sub) {
    throw new HTTPException(400, { message: 'ID token 缺少 sub' });
  }

  const token = await signJwt(
    {
      sub,
      email: email || '',
      picture: picture || '',
      name: name || '',
      given_name: given_name || '',
      family_name: family_name || '',
    },
    c.env
  );

  setCookie(c, getTokenCookieKey(c.env), token);

  return c.json({
    code: 0,
    data: {
      token,
    },
  });
});

export default app;
