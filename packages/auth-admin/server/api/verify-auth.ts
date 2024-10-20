import { H3Event } from 'h3';

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

  return {
    code: 0,
    data: event.context.payload,
  };
});
