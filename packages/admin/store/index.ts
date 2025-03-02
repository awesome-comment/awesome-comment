import { useAuth0 } from '@auth0/auth0-vue';
import type { ResponseBody, AcConfig } from '@awesome-comment/core/types';
import type { MyAdminConfig } from '~/types';
import { ShortcutEmojis } from '~/data';

const useConfigStore = defineStore('config', () => {
  const auth0 = useAuth0();
  const config = ref<AcConfig>({
    adminEmails: [],
    adminDisplayName: '',
    adminDisplayAvatar: '',
    autoApprove: {
      enabled: true,
    },
    shortcutEmojis: ['❤️', '👍', '😂'],
  });
  const myConfig = ref<MyAdminConfig>({
    fixedAiTemplates: [],
    aiTemplateShortcuts: {},
    autoSubmit: [],
  });

  function setConfig(value: Partial<AcConfig>): void {
    Object.assign(config.value, value);
  }
  async function initStore(): Promise<void> {
    const token = await auth0.getAccessTokenSilently();
    if (!token) throw new Error('No access token');

    const { data } = await $fetch<ResponseBody<AcConfig>>('/api/admin/config', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setConfig(data as Partial<AcConfig>);
  }
  async function initMyConfig(): Promise<void> {
    const token = await auth0.getAccessTokenSilently();
    if (!token) throw new Error('No access token');

    const { data } = await $fetch<ResponseBody<MyAdminConfig>>('/api/admin/my', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    Object.assign(myConfig.value, data);
  }
  async function updateMyConfig(value: Partial<MyAdminConfig>): Promise<void> {
    const token = await auth0.getAccessTokenSilently();
    if (!token) throw new Error('No access token');

    Object.assign(myConfig.value, value);
    await $fetch<ResponseBody<string>>('/api/admin/my', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: myConfig.value,
    });
  }

  return {
    config,
    myConfig,

    initStore,
    setConfig,
    initMyConfig,
    updateMyConfig,
  }
});

export default useConfigStore;
