import type { ResponseBody, AcConfig } from '@awesome-comment/core/types';
import type { MyAdminConfig } from '../types';
import { ShortcutEmojis } from '../data';
import { useAdminAuth } from '../composables/use-admin-auth';

const useConfigStore = defineStore('config', () => {
  const adminAuth = useAdminAuth();
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
    const headers = await adminAuth.buildHeaders();
    const { data } = await $fetch<ResponseBody<AcConfig>>('/api/admin/config', {
      headers: {
        ...headers,
      },
    });
    setConfig(data as Partial<AcConfig>);
  }
  async function initMyConfig(): Promise<void> {
    const headers = await adminAuth.buildHeaders();
    const { data } = await $fetch<ResponseBody<MyAdminConfig>>('/api/admin/my', {
      headers: {
        ...headers,
      },
    });
    Object.assign(myConfig.value, data);
  }
  async function updateMyConfig(value: Partial<MyAdminConfig>): Promise<void> {
    Object.assign(myConfig.value, value);
    const headers = await adminAuth.buildHeaders({
      'Content-Type': 'application/json',
    });
    await $fetch<ResponseBody<string>>('/api/admin/my', {
      method: 'POST',
      headers: {
        ...headers,
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
