import { get } from '@vercel/edge-config';
import digestFetch, { FetchError } from '@meathill/digest-fetch';
import { Comment, ResponseBody, User } from '@awesome-comment/core/types';

export default defineEventHandler(async function (event): Promise<ResponseBody<Record<string, never>>> {
  const headers = getHeaders(event);
  const authorization = headers[ 'authorization' ];
  if (!authorization) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const body = await readBody(event);
  if (!body.status) {
    throw createError({
      statusCode: 400,
      message: 'Status is required',
    });
  }
  if (!body.id) {
    throw createError({
      statusCode: 400,
      message: 'comment id is required',
    });
  }

  const adminUser = await get('admin') as string;
  const adminPassword = await get('password') as string;
  const [email, password] = btoa(authorization).split(':');
  if (adminUser !== email || adminPassword !== password) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  try {
    const url = 'https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/moderator/review';
    await digestFetch(url,
      {
        status: body.status,
        id: body.id,
      },
      {
        method: 'POST',
        realm: 'tidb.cloud',
        username: process.env.TIDB_PUBLIC_KEY as string,
        password: process.env.TIDB_PRIVATE_KEY as string,
      },
    );
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: (e as FetchError).status,
      message,
    });
  }

  return {
    code: 0,
  };
})
