import { checkUserPermission } from '../utils';

export default defineEventHandler(async function (event) {
  // not visit admin
  const url = getRequestURL(event);
  if (!url.pathname.startsWith('/api/admin')) {
    return;
  }

  const authEndpoint = getHeader(event, 'Auth-Endpoint');
  const siteId = (getHeader(event, 'x-ac-site-id') || '').trim();
  const check = await checkUserPermission(event, authEndpoint, siteId || null);
  if (!check) return;

  const [user, config] = check;
  event.context.user = user;
  event.context.config = config;
});
