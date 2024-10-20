import { H3Event } from 'h3';
import jwt from 'jsonwebtoken';
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

  const payload = event.context.payload;
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
