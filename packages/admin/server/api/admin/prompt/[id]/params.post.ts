import { ResponseBody } from '@awesome-comment/core/types';

/**
 * 保存 prompt 参数到 KV
 * 参数用于调试 prompt 时保存变量值
 */
export default defineEventHandler(async function (event): Promise<ResponseBody<boolean>> {
  const id = getRouterParam(event, 'id');
  const params = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Prompt ID is required',
    });
  }

  try {
    // 保存到 KV
    if (event.context.cloudflare?.env?.KV) {
      const kv = event.context.cloudflare.env.KV;
      const key = `prompt-params:${id}`;
      await kv.put(key, JSON.stringify(params), {
        expirationTtl: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return {
      code: 0,
      data: true,
    };
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }
});
