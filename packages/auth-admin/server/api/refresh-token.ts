import { createError, defineEventHandler, setCookie, type H3Event } from 'h3';
import jwt from 'jsonwebtoken';
import omit from 'lodash-es/omit';
import type { AwesomeUser } from '@awesome-comment/core/types';
import { getJwtExpirationSeconds, getJwtSecret, getTokenCookieKey } from '~/server/utils';

type AwesomeUserJwtPayload = AwesomeUser & {
  iat?: number;
  exp?: number;
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

  const payload = event.context.payload as AwesomeUserJwtPayload | null | undefined;
  if (!payload) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const token = jwt.sign(omit(payload, 'iat', 'exp'), getJwtSecret(), {
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
