import { H3Event } from 'h3';
import { ApiResponse } from '~/types';
import { checkUserPermission, getConfigKey, } from '~/utils/api';

export default defineEventHandler(async function (event: H3Event): Promise<ApiResponse<string>> {
  const body = await readBody(event);

  await checkUserPermission(event);

  const storage = useStorage('config');
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
