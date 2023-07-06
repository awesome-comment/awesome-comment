import { get } from '@vercel/edge-config';

export default defineNuxtRouteMiddleware(async function (to, from) {
  if (!to.path.startsWith('/admin')) return;

  const headers = useRequestHeaders();
  const basicAuth = headers[ 'authorization' ];

  if (!basicAuth) {
    return navigateTo('/api/login');
  }
  const [username, password] = atob(basicAuth.split(' ')[ 1 ]).split(':');
  const adminUser = await get('admin');
  const adminPassword = await get('password');
  if (username !== adminUser || password !== adminPassword) {
    return navigateTo('/api/login');
  } else if (to.path === '/api/login') {
    return navigateTo('/admin');
  }
});
