import { ResponseBody } from '@awesome-comment/core/types';
import { H3Event } from 'h3';
import { getConfigKey } from '~/server/utils';
import createStorage from '~/server/utils/storage';

export default defineEventHandler(async function (event: H3Event): Promise<ResponseBody<string>> {
  const body = await readBody(event);

  const storage = createStorage(event);
  const key = getConfigKey();
  const {
    adminEmails,
    autoApprove,
  } = body;
  await storage.put(key, {
    adminEmails,
    autoApprove,
  });

  return {
    code: 0,
    data: 'ok',
  };
});
