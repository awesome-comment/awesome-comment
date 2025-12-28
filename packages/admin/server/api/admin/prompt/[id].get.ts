import { ResponseBody } from '@awesome-comment/core/types';
import type { AiPromptTemplate } from '~/types';

export default defineEventHandler(async function (event): Promise<ResponseBody<AiPromptTemplate | null>> {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Prompt ID is required',
    });
  }

  const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);

  try {
    const response = await fetch(`${process.env.TIDB_END_POINT}/v1/prompt?id=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
      },
    });
    const result = await response.json();
    const rows = result.data?.rows || [];

    if (rows.length === 0) {
      return {
        code: 404,
        data: null,
        message: 'Prompt not found',
      };
    }

    const row = rows[ 0 ];
    const data: AiPromptTemplate = {
      ...row,
      allowed_emails: typeof row.allowed_emails === 'string'
        ? JSON.parse(row.allowed_emails)
        : (row.allowed_emails || []),
    };

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
