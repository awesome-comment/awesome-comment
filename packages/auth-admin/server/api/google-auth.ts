import { createError, defineEventHandler, readBody, setCookie, type H3Event } from 'h3';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { getJwtExpirationSeconds, getJwtSecret, getTokenCookieKey } from '~/server/utils';

type GoogleAuthRequestBody = {
  credential?: string;
};

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

  const body = await readBody<GoogleAuthRequestBody>(event);
  const credential = body.credential;
  if (!credential) {
    throw createError({
      statusCode: 400,
      message: '缺少 credential',
    });
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    throw createError({
      statusCode: 500,
      message: 'GOOGLE_CLIENT_ID 未配置',
    });
  }

  const client = new OAuth2Client(googleClientId);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: googleClientId,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw createError({
      statusCode: 400,
      message: 'Failed to verify ID token',
    });
  }
  const { sub, email, picture, name, given_name, family_name } = payload;

  if (!sub) {
    throw createError({
      statusCode: 400,
      message: 'ID token 缺少 sub',
    });
  }

  const token = jwt.sign({
    sub,
    email: email || '',
    picture: picture || '',
    name: name || '',
    given_name: given_name || '',
    family_name: family_name || '',
  }, getJwtSecret(), {
    expiresIn: getJwtExpirationSeconds(),
  });

  setCookie(event, getTokenCookieKey(), token);

  return {
    code: 0,
    data: {
      token,
    },
  };
});
