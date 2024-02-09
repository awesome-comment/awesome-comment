import { ResponseBody } from '@awesome-comment/core/types';
import { H3Event } from 'h3';
import { getConfigKey } from '~/utils/api';

export default defineEventHandler(async function (event: H3Event): Promise<ResponseBody<string>> {
  const body = await readBody(event);

  const storage = useStorage('awesome-comment');
  const key = getConfigKey();
  const {
    adminEmails,
    autoApprove,
  } = body;
  await storage.setItem(key, {
    adminEmails,
    autoApprove,
  });

  return {
    code: 0,
    data: 'ok',
  };
});
