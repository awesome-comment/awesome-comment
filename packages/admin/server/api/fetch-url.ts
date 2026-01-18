import { H3Event } from 'h3';
import type { ResponseBody } from '@awesome-comment/core/types';
import { checkUserPermission } from '~/server/utils';

function isPrivateHost(hostname: string): boolean {
  // 屏蔽本地或内网地址，避免 SSRF 探测
  return /^(localhost|0\.0\.0\.0|127\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.|\[?::1\]?|169\.254\.169\.254)/i.test(
    hostname,
  );
}

export default defineEventHandler(async function (event: H3Event): Promise<ResponseBody<{ title: string }> | void> {
  // 允许 CORS 预检请求通过（OPTIONS 不会携带 Authorization）
  const didHandleCors = handleCors(event, {
    origin: '*',
    methods: ['GET', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type'],
    preflight: {
      statusCode: 204,
    },
  });
  if (didHandleCors) return;

  // 仅限已登录管理员调用，避免被匿名利用探测内网
  await checkUserPermission(event);

  const { url } = getQuery(event);
  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'url is required',
    });
  }

  let target: URL;
  try {
    target = new URL(url as string);
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'invalid url',
    });
  }

  if (!['http:', 'https:'].includes(target.protocol) || isPrivateHost(target.hostname)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'url not allowed',
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  let text = '';
  try {
    const res = await fetch(target, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'awesome-comment-admin/1.0',
      },
    });
    const contentLength = res.headers.get('content-length');
    if (contentLength && Number(contentLength) > 512 * 1024) {
      throw createError({
        statusCode: 413,
        statusMessage: 'content too large',
      });
    }
    text = await res.text();
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw createError({
        statusCode: 504,
        statusMessage: 'fetch timeout',
      });
    }
    throw createError({
      statusCode: 400,
      statusMessage: (error as Error).message || 'failed to fetch url',
    });
  }
  clearTimeout(timeout);

  const title = text.match(/<title>(.*?)<\/title>/i)?.[1] || 'No title';
  setHeader(event, 'cache-control', 'public, max-age=' + 60 * 30);
  return {
    code: 0,
    data: {
      title,
    },
  };
});
