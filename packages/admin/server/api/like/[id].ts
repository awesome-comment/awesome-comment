import { H3Event } from 'h3';

export default defineEventHandler(function(event: H3Event): string {
  if (isMethod(event, 'OPTIONS')) {
    return '';
  }

  throw createError({
    statusCode: 405,
    message: 'Method Not Allowed',
  });
});
