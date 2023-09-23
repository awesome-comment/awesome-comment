import { createAuth0 } from '@auth0/auth0-vue';

export default defineNuxtPlugin(function (nuxtApp) {
  if (!process.client) return;

  const runtime = useRuntimeConfig();
  const auth0 = createAuth0({
    domain: runtime.public.auth0Domain as string,
    clientId: runtime.public.auth0ClientId as string,
    authorizationParams: {
      redirect_uri: location.origin,
    },
  });

  nuxtApp.vueApp.use(auth0);

  addRouteMiddleware('auth', async function (to) {
    if (!process.client) return;

    await auth0.checkSession();
    if (!auth0.isAuthenticated.value) {
      navigateTo('/admin/login');
    }
  });
});
