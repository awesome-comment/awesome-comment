import { useAuth0 } from '@auth0/auth0-vue';
import { useAdminSiteId } from './use-admin-site-id';

type AdminAuthHeaders = Record<string, string>;
type AdminUser = {
  email: string;
  name: string;
  picture: string;
};

function hasAuth0Enabled(): boolean {
  const domain = typeof __AUTH0_DOMAIN__ === 'string' ? __AUTH0_DOMAIN__ : '';
  const clientId = typeof __AUTH0_CLIENT_ID__ === 'string' ? __AUTH0_CLIENT_ID__ : '';
  return Boolean(domain && clientId);
}

function getTokenCookieName(): string {
  const runtimeConfig = useRuntimeConfig();
  const prefix = (runtimeConfig.public?.keyPrefix || '').trim() || 'ac';
  return `${prefix}-token`;
}

function getAuthEndpointHeaderValue(): string {
  if (!import.meta.client) return '';
  return new URL('/api/auth', window.location.origin).toString();
}

function decodeBase64UrlToString(base64Url: string): string {
  const normalized = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const base64 = `${normalized}${padding}`;

  if (import.meta.server) {
    return Buffer.from(base64, 'base64').toString('utf8');
  }

  return atob(base64);
}

function tryDecodeJwtPayload(token: string): Record<string, unknown> | null {
  const value = token.trim();
  if (!value) return null;
  const parts = value.split('.');
  if (parts.length < 2) return null;

  try {
    const json = decodeBase64UrlToString(parts[ 1 ]);
    const payload = JSON.parse(json) as unknown;
    return payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function tryParseUser(payload: Record<string, unknown> | null): AdminUser | null {
  const email = typeof payload?.email === 'string' ? payload.email : '';
  if (!email) return null;

  const name = (typeof payload?.name === 'string' ? payload.name : '').trim() || email;
  const picture = typeof payload?.picture === 'string' ? payload.picture : '';
  return {
    email,
    name,
    picture,
  };
}

export function useAdminAuth() {
  const siteId = useAdminSiteId();
  const tokenCookie = useCookie<string>(getTokenCookieName(), {
    default() {
      return '';
    },
  });
  const isAuth0Enabled = hasAuth0Enabled();

  const user = computed<AdminUser | null>(function () {
    if (isAuth0Enabled && import.meta.client) {
      const auth0 = useAuth0();
      const current = auth0.user.value;
      const email = (current?.email || '').trim();
      if (!email) return null;

      const name = (current?.name || '').trim() || email;
      const picture = (current?.picture || '').trim() || '';
      return {
        email,
        name,
        picture,
      };
    }

    const payload = tryDecodeJwtPayload(tokenCookie.value);
    return tryParseUser(payload);
  });

  const isAuthenticated = computed<boolean>(function () {
    if (isAuth0Enabled && import.meta.client) {
      const auth0 = useAuth0();
      return !!auth0.isAuthenticated.value;
    }
    return !!tokenCookie.value;
  });

  const isLoading = computed<boolean>(function () {
    if (isAuth0Enabled && import.meta.client) {
      const auth0 = useAuth0();
      return !!auth0.isLoading.value;
    }
    return false;
  });

  async function getAccessToken(): Promise<string> {
    if (isAuth0Enabled && import.meta.client) {
      const auth0 = useAuth0();
      return (await auth0.getAccessTokenSilently()) || '';
    }

    return tokenCookie.value || '';
  }

  async function buildHeaders(extra?: AdminAuthHeaders): Promise<AdminAuthHeaders> {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('No access token');
    }

    const headers: AdminAuthHeaders = {
      Authorization: `Bearer ${token}`,
    };

    const currentSiteId = (siteId.value || '').trim();
    if (currentSiteId) {
      headers['X-Ac-Site-Id'] = currentSiteId;
    }

    if (!isAuth0Enabled) {
      headers['Auth-Endpoint'] = getAuthEndpointHeaderValue();
    }

    if (extra) {
      Object.assign(headers, extra);
    }

    return headers;
  }

  async function login(): Promise<void> {
    if (isAuth0Enabled && import.meta.client) {
      const auth0 = useAuth0();
      await auth0.checkSession();
      if (!auth0.isAuthenticated.value) {
        await auth0.loginWithPopup();
      }
      return;
    }

    if (import.meta.client) {
      const route = useRoute();
      const next = route.fullPath;
      navigateTo(`/login?redirect=${encodeURIComponent(next)}`);
    }
  }

  async function logout(): Promise<void> {
    if (isAuth0Enabled && import.meta.client) {
      const auth0 = useAuth0();
      await auth0.logout();
      return;
    }

    tokenCookie.value = '';
    if (import.meta.client) {
      navigateTo('/login');
    }
  }

  return {
    siteId,
    user,
    isAuthenticated,
    isLoading,
    getAccessToken,
    buildHeaders,
    login,
    logout,
  };
}
