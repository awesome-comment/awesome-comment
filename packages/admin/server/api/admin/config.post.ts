import type { AcConfig, ResponseBody } from '@awesome-comment/core/types';
import { H3Event } from 'h3';
import { getConfigKey } from '~/server/utils';
import createStorage from '@awesome-comment/core/utils/storage';

export default defineEventHandler(async function (event: H3Event): Promise<ResponseBody<string>> {
  const body = (await readBody(event)) as AcConfig;

  const storage = createStorage(event);
  const key = getConfigKey();
  const {
    adminEmails,
    autoApprove,
    adminDisplayName,
    adminDisplayAvatar,
    shortcutEmojis,
  } = body;
  await storage.put(key, {
    adminEmails,
    autoApprove,
    adminDisplayName,
    adminDisplayAvatar,
    shortcutEmojis,
  });

  return {
    code: 0,
    data: 'ok',
  };
});
