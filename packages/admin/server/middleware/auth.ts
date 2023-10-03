import { checkUserPermission } from '~/utils/api';

export default defineEventHandler(async function (event) {
  // not visit admin
  const url = getRequestURL(event);
  if (!url.pathname.startsWith('/api/admin')) {
    return;
  }

  const check = await checkUserPermission(event);
  if (check) {
    const [user, config] = check;
    event.context.user = user;
    event.context.config = config;
  } else {
    throw createError({
      statusCode: 403,
      message: 'Forbidden',
    });
  }
});
