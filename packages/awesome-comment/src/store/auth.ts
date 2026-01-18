import { defineStore } from 'pinia';
import { computed, inject, ref, watch } from 'vue';
import { type LogoutOptions, useAuth0, User } from '@auth0/auth0-vue';
import { AwesomeAuth, AwesomeAuthEvent, type GoogleButtonOptions } from '@roudanio/awesome-auth';

const useAuthStore = defineStore('auth', () => {
  const awesomeAuth = inject('awesomeAuth') as AwesomeAuth | undefined;
  const auth0 = !awesomeAuth && useAuth0();
  const isAuthenticated = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const user = ref<User>();
  const isAwesomeAuth = !!awesomeAuth;
  const authEndpoint = computed<string>(() => {
    return awesomeAuth ? awesomeAuth.root : '';
  });

  async function getAccessToken(): Promise<string> {
    if (awesomeAuth) return awesomeAuth.accessToken;

    return auth0 ? await auth0.getAccessTokenSilently() : '';
  }
  function login() {
    if (awesomeAuth) {
      awesomeAuth.doSignIn();
    } else if (auth0) {
      auth0.loginWithPopup();
    }
  }
  function logout(options?: LogoutOptions) {
    if (awesomeAuth) {
      awesomeAuth.doSignOut();
    } else if (auth0) {
      auth0.logout(options);
    }
  }
  async function renderGoogleButton(target: HTMLElement, options?: GoogleButtonOptions): Promise<void> {
    if (!awesomeAuth) return;
    await awesomeAuth.renderButton(target, options);
  }

  if (awesomeAuth) {
    awesomeAuth.on(AwesomeAuthEvent.INIT, (value: boolean) => {
      isLoading.value = value;
      if (value) {
        isAuthenticated.value = false;
      }
    });
    awesomeAuth.on(AwesomeAuthEvent.VERIFYING, (value: boolean) => {
      isLoading.value = value;
    });
    awesomeAuth.on(AwesomeAuthEvent.VERIFIED, (value: boolean) => {
      isAuthenticated.value = value;
      user.value = value ? awesomeAuth.user : undefined;
    });
    isLoading.value = awesomeAuth.isVerifying;
    isAuthenticated.value = awesomeAuth.isVerified;
    user.value = awesomeAuth.user;
  } else if (auth0) {
    watch(
      auth0.isLoading,
      (value) => {
        isLoading.value = value;
      },
      { immediate: true },
    );
    watch(
      auth0.isAuthenticated,
      (value) => {
        isAuthenticated.value = value;
      },
      { immediate: true },
    );
    watch(
      auth0.user,
      (value) => {
        user.value = value;
      },
      { immediate: true },
    );
  }

  return {
    isAuthenticated,
    isAwesomeAuth,
    isLoading,
    authEndpoint,
    user,

    getAccessToken,
    renderGoogleButton,
    login,
    logout,
  };
});
export default useAuthStore;
