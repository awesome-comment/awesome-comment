import { H3Event } from 'h3';
import jwt from 'jsonwebtoken';

export default defineEventHandler(async function (event: H3Event){
  const method = event.node.req.method;
  if (method === 'OPTIONS') {
    return '';
  } else if (method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed',
    });
  }

  const body = await readBody(event);
  try {
    const isVerified = jwt.verify(body.token, process.env.JWT_SECRET as string);
    return {
      code: 0,
      data: {
        verified: isVerified,
      },
    };
  } catch (e) {
    return {
      code: 1,
      data: {
        verified: false,
        message: (e as Error).message || String(e),
      },
    };
  }



});
