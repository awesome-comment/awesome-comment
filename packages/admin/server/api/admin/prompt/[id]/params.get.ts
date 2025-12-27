import { ResponseBody } from '@awesome-comment/core/types';

/**
 * 从 Redis 获取 prompt 参数
 * 参数用于调试 prompt 时保存变量值
 */
export default defineEventHandler(async function (event): Promise<ResponseBody<Record<string, string>>> {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Prompt ID is required',
    });
  }

  try {
    // 尝试从 KV 获取参数
    if (event.context.cloudflare?.env?.KV) {
      const kv = event.context.cloudflare.env.KV;
      const key = `prompt-params:${id}`;
      const params = await kv.get(key, 'json');
      return {
        code: 0,
        data: params || {},
      };
    }

    // 没有 KV 时返回空对象
    return {
      code: 0,
      data: {},
    };
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }
});
