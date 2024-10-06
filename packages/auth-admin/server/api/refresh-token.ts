import { H3Event } from 'h3';
import jwt, { JwtPayload } from 'jsonwebtoken';
import omit from 'lodash-es/omit';

export default defineEventHandler(async function (event: H3Event){
  const method = event.node.req.method;
  if (method === 'OPTIONS') {
    return '';
  }

  if (method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed',
    });
  }

  const body = await readBody(event);
  try {
    const isVerified = jwt.verify(body.token, process.env.JWT_SECRET as string);
    if (!isVerified) {
      return {
        code: 1,
        data: {
          verified: false,
          message: 'Invalid token',
        },
      };
    }

  } catch (e) {
    return {
      code: 1,
      data: {
        verified: false,
        message: (e as Error).message || String(e),
      },
    };
  }

  const payload = jwt.decode(body.token) as JwtPayload;
  const token = jwt.sign(omit(payload, 'iat', 'exp'), process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRATION || '1h',
  });

  setCookie(event, `${process.env.KEY_PREFIX || 'aAuth'}-token`, token);
  return {
    code: 0,
    data: {
      token,
    },
  };
});
