import { H3Event } from 'h3';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

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
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: body.credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw createError({
      statusCode: 400,
      message: 'Failed to verify ID token',
    });
  }
  const { sub, email, picture, name, given_name, family_name } = payload;
  const token = jwt.sign({
    sub,
    email,
    picture,
    name,
    given_name,
    family_name,
  }, process.env.JWT_SECRET as string, {
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
