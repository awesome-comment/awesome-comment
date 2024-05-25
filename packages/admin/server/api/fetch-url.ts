import { H3Event } from 'h3';
import type { ResponseBody } from '@awesome-comment/core/types';

export default defineEventHandler(async function (event: H3Event): Promise<ResponseBody<{ title: string }>> {
  const { url } = getQuery(event);
  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'url is required',
    });
  }

  const res = await fetch(url as string);
  const text = await res.text();
  const title = text.match(/<title>(.*?)<\/title>/)?.[ 1 ] || 'No title';
  setHeader(event, 'cache-control', 'public, max-age=' + 60 * 60 * 24 * 30);
  return {
    code: 0,
    data: {
      title,
    },
  };
});
