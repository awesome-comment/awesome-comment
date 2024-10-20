import { ResponseBody } from '@awesome-comment/core/types';
import { H3Event } from 'h3';
import createStorage from '@awesome-comment/core/utils/storage';
import { getMyConfigKey } from '~/server/utils';
import { MyAdminConfig } from '~/types';

export default defineEventHandler(async function (event: H3Event): Promise<ResponseBody<MyAdminConfig>> {
  const storage = createStorage(event);
  const key = getMyConfigKey(event.context.user.email);
  const config = await storage.get(key);

  return {
    code: 0,
    data: config as MyAdminConfig,
  };
});
