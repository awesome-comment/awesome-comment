import { get } from '@vercel/edge-config';
import digestFetch, { FetchError } from '@meathill/digest-fetch';
import { Comment, ResponseBody, User } from '@awesome-comment/core/types';

export default defineEventHandler(async function (event): Promise<ResponseBody<{}>> {
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

  const admins = await get('admins') as string[];
  const email = btoa(authorization).split(':')[ 0 ];
  if (!admins.includes(email)) {
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
        username: process.env.TIDB_PUBLIC_KEY,
        password: process.env.TIDB_PRIVATE_KEY,
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
