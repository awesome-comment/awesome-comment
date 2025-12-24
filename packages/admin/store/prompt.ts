import type { ResponseBody } from '@awesome-comment/core/types';
import type { AiPromptTemplate } from '../types';
import { useAdminAuth } from '../composables/use-admin-auth';

const usePromptStore = defineStore('prompt', () => {
  const adminAuth = useAdminAuth();
  const isLoading = ref<boolean>(false);
  const prompts = ref<Record<string, AiPromptTemplate>>({});

  // Fetch data from server
  async function refreshPrompts(): Promise<void> {
    isLoading.value = true;
    const { data } = await $fetch<ResponseBody<AiPromptTemplate[]>>('/api/admin/ai-templates', {
      headers: {
        ...(await adminAuth.buildHeaders({
          'Content-Type': 'application/json',
        })),
      },
    });
    (data || [])
      .forEach((prompt) => {
        const title = prompt.title.replace(/^ac-/i, '');
        prompts.value[prompt.id] = {
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
