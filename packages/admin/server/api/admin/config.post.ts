import { ResponseBody } from '@awesome-comment/core/types';
import { H3Event } from 'h3';
import { getConfigKey } from '~/server/utils';

export default defineEventHandler(async function (event: H3Event): Promise<ResponseBody<string>> {
  const body = await readBody(event);

  const KV = event.context.cloudflare.env.KV;
  const key = getConfigKey();
  const {
    adminEmails,
    autoApprove,
  } = body;
  await KV.put(key, JSON.stringify({
    adminEmails,
    autoApprove,
  }));

  return {
    code: 0,
    data: 'ok',
  };
});
