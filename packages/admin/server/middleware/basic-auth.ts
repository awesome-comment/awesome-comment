// https://titouan.dev/notes/2023/03/10/basic-auth-middleware-nuxt-3

import { appendHeader, createError, getHeader } from 'h3';
import { get } from '@vercel/edge-config';

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  if (!url.pathname.startsWith('/admin')) {
    return;
  }

  const adminUser = await get('admin');
  const adminPassword = await get('password');
  const basicAuth = btoa(`${adminUser}:${adminPassword}`);

  // Format our credentials to their corresponding header:
  // `user:pass` becomes `Basic dXNlcjpwYXNz`
  const validAuthHeader = 'Basic ' + basicAuth;
  const authHeader = getHeader(event, 'authorization');

  // If the given authentication header is valid, do not prompt for authentication
  if (authHeader && validAuthHeader === authHeader) {
    return;
  }

  // Set the `www-authenticate` header to prompt for authentication
  // The realm attribute can be used to customize the message shown to the user
  appendHeader(event, 'www-authenticate', 'Basic realm="Identification"');
  throw createError({ statusCode: 401, statusMessage: 'Not authorized' });
});
