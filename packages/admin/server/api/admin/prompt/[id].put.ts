import { ResponseBody } from '@awesome-comment/core/types';

export default defineEventHandler(async function (event): Promise<ResponseBody<number>> {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { title, content, allowed_emails = [] } = body;

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Prompt ID is required',
    });
  }

  if (!title || !content) {
    throw createError({
      statusCode: 400,
      message: 'Title and content are required',
    });
  }

  const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);

  try {
    const response = await fetch(`${process.env.TIDB_END_POINT}/v1/prompt`, {
      method: 'PUT',
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: parseInt(id),
        title,
        content,
        allowed_emails: JSON.stringify(allowed_emails),
      }),
    });

    const data = await response.json();

    return {
      code: 0,
      data,
    };
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }
});
