import type { ResponseBody } from '@awesome-comment/core/types';
import type { AiPromptTemplate } from '~/types';
import { useAuth0 } from '@auth0/auth0-vue';

const usePromptStore = defineStore('prompt', () => {
  const auth0 = useAuth0();
  const isLoading = ref<boolean>(false);
  const prompts = ref<Record<string, AiPromptTemplate>>({});

  async function getAuthHeaders(): Promise<Record<string, string>> {
    const token = await auth0.getAccessTokenSilently();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  // Fetch all prompts from server
  async function refreshPrompts(): Promise<void> {
    isLoading.value = true;
    const headers = await getAuthHeaders();
    const { data } = await $fetch<ResponseBody<AiPromptTemplate[]>>('/api/admin/ai-templates', {
      headers,
    });
    (data || []).forEach((prompt) => {
      const title = prompt.title.replace(/^ac-/i, '');
      prompts.value[prompt.id] = {
        ...prompt,
        title,
      };
    });
    isLoading.value = false;
  }

  // Get single prompt
  async function getPrompt(id: number): Promise<AiPromptTemplate | null> {
    if (prompts.value[id]) {
      return prompts.value[id];
    }
    const headers = await getAuthHeaders();
    const { data } = await $fetch<ResponseBody<AiPromptTemplate | null>>(`/api/admin/prompt/${id}`, {
      headers,
    });
    if (data) {
      prompts.value[id] = data;
    }
    return data;
  }

  // Create new prompt
  async function createPrompt(title: string, content: string, allowedEmails: string[] = []): Promise<number> {
    const headers = await getAuthHeaders();
    const { data: id } = await $fetch<ResponseBody<number>>('/api/admin/prompt', {
      method: 'POST',
      headers,
      body: {
        title,
        content,
        allowed_emails: allowedEmails,
      },
    });
    return id;
  }

  // Update existing prompt
  async function updatePrompt(id: number, title: string, content: string, allowedEmails: string[] = []): Promise<void> {
    const headers = await getAuthHeaders();
    await $fetch<ResponseBody<number>>(`/api/admin/prompt/${id}`, {
      method: 'PUT',
      headers,
      body: {
        title,
        content,
        allowed_emails: allowedEmails,
      },
    });
    // Update local cache
    if (prompts.value[id]) {
      prompts.value[id] = {
        ...prompts.value[id],
        title,
        content,
        allowed_emails: allowedEmails,
      };
    }
  }

  // Delete prompt
  async function deletePrompt(id: number): Promise<void> {
    const headers = await getAuthHeaders();
    await $fetch<ResponseBody<number>>(`/api/admin/prompt/${id}`, {
      method: 'DELETE',
      headers,
    });
    // Remove from local cache
    delete prompts.value[id];
  }

  // Set prompts (used for local updates)
  function setPrompts(items: AiPromptTemplate[]): void {
    items.forEach((prompt) => {
      prompts.value[prompt.id] = prompt;
    });
  }

  return {
    isLoading,
    prompts,

    refreshPrompts,
    getPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    setPrompts,
  };
});

export default usePromptStore;
