import type { ResponseBody } from '@awesome-comment/core/types';
import type { AiPromptTemplate } from '~/types';
import { useAuth0 } from '@auth0/auth0-vue';

const usePromptStore = defineStore('prompt', () => {
  const auth0 = useAuth0();
  const isLoading = ref<boolean>(false);
  const prompts = ref<Record<string, AiPromptTemplate>>({});

  // Fetch data from server
  async function refreshPrompts(): Promise<void> {
    isLoading.value = true;
    const token = await auth0.getAccessTokenSilently();
    const { data } = await $fetch<ResponseBody<AiPromptTemplate[]>>('/api/admin/ai-templates', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    (data || [])
      .forEach((prompt) => {
        const title = prompt.title.replace(/^ac-/i, '');
        prompts.value[ prompt.id ] = {
          ...prompt,
          title,
        };
      });
    isLoading.value = false;
  }

  return {
    isLoading,
    prompts,

    refreshPrompts,
  };
});

export default usePromptStore;
