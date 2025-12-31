import { defineEventHandler, type H3Event } from "h3";
import { getTokenCookieKey, signJwt } from '~/server/utils';
import pkg from '../../package.json';

export default defineEventHandler(async function (event: H3Event){
  const method = event.node.req.method;
  if (method === 'OPTIONS') {
    console.log('xxx', getTokenCookieKey, signJwt);
    return pkg.version;
  }

  return 'ok';
});
