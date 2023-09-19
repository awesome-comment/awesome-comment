import { AcConfig } from '~/types';

const useConfigStore = defineStore('config', () => {
  const config = ref<AcConfig>({
    adminEmails: [],
  });

  function setConfig(value: Partial<AcConfig>): void {
    Object.assign(config.value, value);
  }

  return {
    config,
    setConfig,
  }
});

export {
  useConfigStore,
};
