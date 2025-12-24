import { useAdminAuth } from '../composables/use-admin-auth';

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const adminAuth = useAdminAuth();
    if (!adminAuth.isAuthenticated.value) {
      return navigateTo('/admin/login');
    }
  }
});
