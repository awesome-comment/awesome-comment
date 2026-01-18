import { createError, defineEventHandler, setCookie, type H3Event } from 'h3';
import omit from 'lodash-es/omit';
import type { AwesomeUser } from '@awesome-comment/core/types';
import { getTokenCookieKey, signJwt } from '~/server/utils';

type AwesomeUserJwtPayload = AwesomeUser & {
  iat?: number;
  exp?: number;
};

export default defineEventHandler(async function (event: H3Event) {
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

  const token = await signJwt(omit(payload, 'iat', 'exp'));

  setCookie(event, getTokenCookieKey(), token);
  return {
    code: 0,
    data: {
      token,
    },
  };
});
