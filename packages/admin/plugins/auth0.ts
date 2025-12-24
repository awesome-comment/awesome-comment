import { createAuth0 } from '@auth0/auth0-vue';

function getAuth0Env() {
  const domain = typeof __AUTH0_DOMAIN__ === 'string' ? __AUTH0_DOMAIN__ : '';
  const clientId = typeof __AUTH0_CLIENT_ID__ === 'string' ? __AUTH0_CLIENT_ID__ : '';
  return {
    domain,
    clientId,
    hasAuth0: Boolean(domain && clientId),
  };
}

export default defineNuxtPlugin(function (nuxtApp) {
  if (!import.meta.client) return;

  const { domain, clientId, hasAuth0 } = getAuth0Env();
  const runtimeConfig = useRuntimeConfig();
  const prefix = (runtimeConfig.public?.keyPrefix || '').trim() || 'ac';
  const tokenCookie = useCookie<string>(`${prefix}-token`, {
    default() {
      return '';
    },
  });
  const siteIdStorageKey = `${prefix}-admin-site-id`;

  const auth0 = hasAuth0
    ? createAuth0({
      domain,
      clientId,
      authorizationParams: {
        redirect_uri: location.origin,
      },
    })
    : null;

  if (auth0) {
    nuxtApp.vueApp.use(auth0);
  }

  addRouteMiddleware('auth', async function (to) {
    if (!import.meta.client) return;

    if (to.path.startsWith('/admin')) {
      const querySiteId = typeof to.query.siteId === 'string' ? to.query.siteId.trim() : '';
      if (querySiteId) {
        try {
          window.localStorage.setItem(siteIdStorageKey, querySiteId);
        } catch {
          // ignore
        }
      } else {
        let storedSiteId = '';
        try {
          storedSiteId = window.localStorage.getItem(siteIdStorageKey) || '';
        } catch {
          storedSiteId = '';
        }
        if (storedSiteId) {
          return navigateTo({
            path: to.path,
            query: {
              ...to.query,
              siteId: storedSiteId,
            },
          }, { replace: true });
        }
      }
    }

    if (auth0) {
      await auth0.checkSession();
      if (!auth0.isAuthenticated.value) {
        navigateTo('/admin/login');
      }
      return;
    }

    if (to.path === '/admin/login') return;
    if (!tokenCookie.value) {
      navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
  });
});
