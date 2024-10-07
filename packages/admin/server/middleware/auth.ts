import { checkUserPermission } from '~/server/utils';

export default defineEventHandler(async function (event) {
  // not visit admin
  const url = getRequestURL(event);
  if (!url.pathname.startsWith('/api/admin')) {
    return;
  }

  const authEndpoint = getHeader(event, 'Auth-Endpoint');
  const check = await checkUserPermission(event, authEndpoint);
  if (!check) return;

  const [user, config] = check;
  event.context.user = user;
  event.context.config = config;
});
