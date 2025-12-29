import { useAuth0 } from '@auth0/auth0-vue';

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.client) {
    const auth0 = useAuth0();
    if (!auth0.isAuthenticated.value) {
      return navigateTo('/admin/login');
    }
  }
});
