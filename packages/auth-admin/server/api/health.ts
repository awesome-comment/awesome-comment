import { defineEventHandler, type H3Event } from "h3";
import { OAuth2Client } from 'google-auth-library';
import { getTokenCookieKey, signJwt } from '~/server/utils';
import pkg from '../../package.json';

export const runtime = 'edge';

export default defineEventHandler(async function (event: H3Event){
  const method = event.node.req.method;
  if (method === 'OPTIONS') {
    console.log('xxx', getTokenCookieKey, signJwt, OAuth2Client);
    return pkg.version;
  }

  return 'ok';
});
