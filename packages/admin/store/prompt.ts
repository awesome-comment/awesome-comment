import type { AiPromptTemplate } from '~/types';

const LOCAL_KEY = 'ac-prompt-templates';

const usePromptStore = defineStore('prompt', () => {
  let isInit = false;
  const prompts = ref<Record<string, AiPromptTemplate>>({});

  function setPrompt(prompt: AiPromptTemplate, id?: string): string {
    id ||= crypto.randomUUID();
    prompts.value[ id ] = prompt;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(prompts.value));
    return id;
  }
  function deletePrompt(id: string) {
    delete prompts.value[ id ];
    localStorage.setItem(LOCAL_KEY, JSON.stringify(prompts.value));
  }
  function init(): void {
    if (isInit) return;

    isInit = true;
    const localData = localStorage.getItem(LOCAL_KEY);
    if (localData) {
      prompts.value = JSON.parse(localData);
    }
  }

  return {
    prompts,

    setPrompt,
    deletePrompt,
    init,
  };
});

export default usePromptStore;
