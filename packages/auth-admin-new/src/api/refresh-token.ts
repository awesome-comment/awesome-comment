import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import omit from 'lodash-es/omit';
import type { AwesomeUser } from '@awesome-comment/core/types';
import type { Env } from '../utils';
import { signJwt, getTokenCookieKey } from '../utils';

type AwesomeUserJwtPayload = AwesomeUser & {
  iat?: number;
  exp?: number;
};

const app = new Hono<{ Bindings: Env }>();

app.post('/', async (c) => {
  const payload = c.get('payload') as AwesomeUserJwtPayload | null | undefined;

  if (!payload) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  const token = await signJwt(omit(payload, 'iat', 'exp'), c.env);

  setCookie(c, getTokenCookieKey(c.env), token);

  return c.json({
    code: 0,
    data: {
      token,
    },
  });
});

export default app;
