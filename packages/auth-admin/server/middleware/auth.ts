import { checkUserPermission } from '~/server/utils';

export default defineEventHandler(async function (event) {
  // not visit admin
  const url = getRequestURL(event);
  if (url.pathname.endsWith('/google-auth')) {
    return;
  }

  const payload = checkUserPermission(event);
  event.context.payload = payload;
  if (!payload) {
    if (url.pathname.endsWith('/verify-auth')) return;

    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }
});
