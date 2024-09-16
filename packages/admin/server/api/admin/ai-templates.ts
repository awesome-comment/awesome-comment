import { ResponseBody } from '@awesome-comment/core/types';
import type { AiPromptTemplate } from '~/types';

export default defineEventHandler(async function (): Promise<ResponseBody<AiPromptTemplate[]>> {
  const { data } = await $fetch<ResponseBody<AiPromptTemplate[]>>(`${process.env.AI_ADMIN_ENDPOINT}/prompts`, {
    headers: {
      'AC_REQUEST_AUTH': `${process.env.AI_ADMIN_AUTH_TOKEN}`,
    },
  });

  return {
    code: 0,
    data,
  };
});
