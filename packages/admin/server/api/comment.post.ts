import { ResponseBody, User } from '@awesome-comment/core/types';
import digestFetch, { FetchError } from '@meathill/digest-fetch';
import { getUser } from '~/utils/api';
import { getTidbKey } from '~/utils/tidb';

export default defineEventHandler(async function (event): Promise<ResponseBody<number>> {
  const headers = getHeaders(event);
  const authorization = headers[ 'authorization' ];
  if (!authorization) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    });
  }

  const body = await readBody(event);
  if (!body.comment) {
    throw createError({
      statusCode: 400,
      message: 'Comment content is required',
    });
  }

  let user: User | null = null;
  try {
    user = await getUser(authorization, body.domain);
  } catch (e) {
    const message =  (e as Error).message || e;

    throw createError({
      statusCode: 401,
      message: 'Failed to authorized user. ' + message,
    });
  }
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'User not found.',
    });
  }

  const {
    name,
    nickname,
    picture,
    email,
    sub,
  } = user;
  const ip = headers[ 'x-real-ip' ]
    || headers[ 'x-forwarded-for' ]
    || headers[ 'x-client-ip' ]
    || '';
  let id: number | null = null;
  try {
    const url = 'https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-NFYbhmOK/endpoint/v1/post';
    const kv = await getTidbKey();
    const response = await digestFetch(
      url,
      {
        content: body.comment,
        post_id: body.postId,
        user_id: sub,
        user: JSON.stringify({
          email,
          name: nickname || name,
          avatar: picture,
          ip,
        }),
      },
      {
        method: 'POST',
        realm: 'tidb.cloud',
        ...kv,
      },
    );
    const json = await response.json();
    id = Number(json.data.rows[ 0 ].last_insert_id);
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: (e as FetchError).status,
      message,
    });
  }

  return {
    code: 0,
    data: id,
  };
})
