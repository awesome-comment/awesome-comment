import { createAuth0 } from '@auth0/auth0-vue';

export default defineNuxtPlugin(function (nuxtApp) {
  if (!import.meta.client) return;

  const auth0 = createAuth0({
    domain: __AUTH0_DOMAIN__,
    clientId: __AUTH0_CLIENT_ID__,
    authorizationParams: {
      redirect_uri: location.origin,
    },
  });

  nuxtApp.vueApp.use(auth0);

  addRouteMiddleware('auth', async function (to) {
    if (!import.meta.client) return;

    await auth0.checkSession();
    if (!auth0.isAuthenticated.value) {
      navigateTo('/admin/login');
    }
  });
});
