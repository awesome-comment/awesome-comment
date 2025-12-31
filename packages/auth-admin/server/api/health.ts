import { defineEventHandler, type H3Event } from "h3";
import { getTokenCookieKey, signJwt } from '~/server/utils';

export default defineEventHandler(async function (event: H3Event){
  const method = event.node.req.method;
  if (method === 'OPTIONS') {
    console.log('xxx', getTokenCookieKey, signJwt);
    return '';
  }

  return 'ok';
});
