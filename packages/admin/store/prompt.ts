import type { AiPromptTemplate } from '~/types';
import { isSafari } from '~/utils/ui';

const LOCAL_KEY = 'ac-prompt-templates';
const LOCAL_AUTO_COPY = 'ac-prompt-auto-copy';
const LOCAL_RECENT = 'ac-recent-usage';

const usePromptStore = defineStore('prompt', () => {
  let isInit = false;
  const prompts = ref<Record<string, AiPromptTemplate>>({});
  const recentUsage = ref<Record<string, string>>({});
  const _isAutoCopy = ref<boolean>(true);
  const length = computed(() => Object.keys(prompts.value).length);
  const isAutoCopy = computed<boolean>(() => {
    if (import.meta.client && isSafari()) return false;

    return _isAutoCopy.value;
  });

  function setPrompt(prompt: AiPromptTemplate, id?: string): string {
    id ||= crypto.randomUUID();
    prompts.value[ id ] = prompt;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(prompts.value));
    return id;
  }
  function setPromptProp(id: string, props: Partial<AiPromptTemplate>): void {
    Object.assign(prompts.value[ id ], props);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(prompts.value));
  }
  function deletePrompt(id: string) {
    delete prompts.value[ id ];
    localStorage.setItem(LOCAL_KEY, JSON.stringify(prompts.value));
  }
  function importPrompts(data: string): void {
    prompts.value = JSON.parse(data);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(prompts.value));
  }
  function setAutoCopy(value: boolean): void {
    _isAutoCopy.value = value;
    localStorage.setItem(LOCAL_AUTO_COPY, String(value));
  }
  function setRecentUsage(postId: string, promptId: string): void {
    recentUsage.value[ postId ] = promptId;
    localStorage.setItem(LOCAL_RECENT, JSON.stringify(recentUsage.value));
  }
  function init(): void {
    if (isInit) return;

    isInit = true;
    const localData = localStorage.getItem(LOCAL_KEY);
    if (localData) {
      prompts.value = JSON.parse(localData);
    }
    const autoCopy = localStorage.getItem(LOCAL_AUTO_COPY);
    _isAutoCopy.value = !autoCopy || autoCopy === '1';
    const recent = localStorage.getItem(LOCAL_RECENT);
    if (recent) {
      recentUsage.value = JSON.parse(recent);
    }
  }

  return {
    prompts,
    length,
    isAutoCopy,
    recentUsage,

    setPrompt,
    setPromptProp,
    deletePrompt,
    importPrompts,
    setAutoCopy,
    setRecentUsage,
    init,
  };
});

export default usePromptStore;
