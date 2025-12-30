import { defineEventHandler, type H3Event } from "h3";

export default defineEventHandler(async function (event: H3Event){
  const method = event.node.req.method;
  if (method === 'OPTIONS') {
    return '';
  }

  return 'ok';
});
