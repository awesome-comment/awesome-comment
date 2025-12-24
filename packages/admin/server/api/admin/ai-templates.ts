import { ResponseBody } from '@awesome-comment/core/types';
import type { AiPromptTemplate } from '../../../types';

export default defineEventHandler(async function (event): Promise<ResponseBody<AiPromptTemplate[]>> {
  const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);

  try {
    const response = await fetch(`${process.env.TIDB_END_POINT}/v1/prompts`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
      },
    });
    const result = await response.json();
    const data: AiPromptTemplate[] = (result.data?.rows || []).map((row: Record<string, unknown>) => ({
      ...row,
      allowed_emails: typeof row.allowed_emails === 'string'
        ? JSON.parse(row.allowed_emails as string)
        : (row.allowed_emails || []),
    }));

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
