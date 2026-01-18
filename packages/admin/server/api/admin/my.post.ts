import { ResponseBody } from '@awesome-comment/core/types';
import { H3Event } from 'h3';
import { getMyConfigKey } from '~/server/utils';
import createStorage from '@awesome-comment/core/utils/storage';
import { MyAdminConfig } from '~/types';

export default defineEventHandler(async function (event: H3Event): Promise<ResponseBody<string>> {
  const body = (await readBody(event)) as MyAdminConfig;

  const storage = createStorage(event);
  const key = getMyConfigKey(event.context.user.email);
  const { fixedAiTemplates, aiTemplateShortcuts, autoSubmit } = body;
  await storage.put(key, {
    fixedAiTemplates,
    aiTemplateShortcuts,
    autoSubmit,
  });

  return {
    code: 0,
    data: 'ok',
  };
});
