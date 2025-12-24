import { ResponseBody } from '@awesome-comment/core/types';
import { H3Event } from 'h3';
import createStorage from '@awesome-comment/core/utils/storage';
import { getMyConfigKey } from '../../utils';
import { MyAdminConfig } from '../../../types';

export default defineEventHandler(async function (event: H3Event): Promise<ResponseBody<MyAdminConfig>> {
  const storage = createStorage(event);
  const siteId = (getHeader(event, 'x-ac-site-id') || '').trim();
  const key = getMyConfigKey(event.context.user.email, siteId || null);
  const config = await storage.get(key);

  return {
    code: 0,
    data: config as MyAdminConfig,
  };
});
