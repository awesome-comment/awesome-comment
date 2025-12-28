import { ResponseBody } from '@awesome-comment/core/types';

export default defineEventHandler(async function (event): Promise<ResponseBody<number>> {
  const body = await readBody(event);
  const { title, content, allowed_emails = [] } = body;

  if (!title || !content) {
    throw createError({
      statusCode: 400,
      message: 'Title and content are required',
    });
  }

  const owner = event.context.email || 'anonymous';
  const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);

  try {
    const response = await fetch(`${process.env.TIDB_END_POINT}/v1/prompt`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        content,
        owner,
        allowed_emails: JSON.stringify(allowed_emails),
      }),
    });

    const result = await response.json();

    const id = result.data?.rows?.[ 0 ]?.last_insert_id;
    return {
      code: 0,
      data: id || 0,
    };
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }
});
