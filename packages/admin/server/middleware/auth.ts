import { checkUserPermission } from '~/utils/api';

export default defineEventHandler(async function (event) {
  // not visit admin
  const url = getRequestURL(event);
  if (!url.pathname.startsWith('/api/admin')) {
    return;
  }

  event.context.config = await checkUserPermission(event, false);
});
