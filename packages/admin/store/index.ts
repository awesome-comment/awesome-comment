import { AcConfig, ApiResponse } from '~/types';
import { useAuth0 } from '@auth0/auth0-vue';

const useConfigStore = defineStore('config', () => {
  const config = ref<AcConfig>({
    adminEmails: [],
  });

  function setConfig(value: Partial<AcConfig>): void {
    Object.assign(config.value, value);
  }
  async function initStore(): Promise<void> {
    const auth0 = useAuth0();
    const token = await auth0.getAccessTokenSilently();
    if (!token) return;

    const { data } = await $fetch<ApiResponse<AcConfig>>('/api/admin/config', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setConfig(data as Partial<AcConfig>);
  }

  return {
    config,
    initStore,
    setConfig,
  }
});

export {
  useConfigStore,
};
