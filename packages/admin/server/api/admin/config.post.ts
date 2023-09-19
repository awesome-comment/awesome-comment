import { H3Event } from 'h3';
import { ApiResponse } from '~/types';
import { getConfigKey } from '~/utils/api';

export default defineEventHandler(async function (event: H3Event): Promise<ApiResponse<string>> {
  const body = await readBody(event);

  const storage = useStorage('data');
  const key = getConfigKey();
  const {
    adminEmails,
  } = body;
  await storage.setItem(key, {
    adminEmails,
  });

  return {
    code: 0,
    data: 'ok',
  };
});
