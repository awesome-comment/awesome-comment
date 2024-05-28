import type { AiPromptTemplate } from '~/types';

const LOCAL_KEY = 'ac-prompt-templates';
const LOCAL_AUTO_COPY = 'ac-prompt-auto-copy';

const usePromptStore = defineStore('prompt', () => {
  let isInit = false;
  const prompts = ref<Record<string, AiPromptTemplate>>({});
  const isAutoCopy = ref<boolean>(true);
  const length = computed(() => Object.keys(prompts.value).length);

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
    isAutoCopy.value = value;
    localStorage.setItem(LOCAL_AUTO_COPY, String(value));
  }
  function init(): void {
    if (isInit) return;

    isInit = true;
    const localData = localStorage.getItem(LOCAL_KEY);
    if (localData) {
      prompts.value = JSON.parse(localData);
    }
    const autoCopy = localStorage.getItem(LOCAL_AUTO_COPY);
    isAutoCopy.value = !autoCopy || autoCopy === '1';
  }

  return {
    prompts,
    length,
    isAutoCopy,

    setPrompt,
    setPromptProp,
    deletePrompt,
    importPrompts,
    setAutoCopy,
    init,
  };
});

export default usePromptStore;
