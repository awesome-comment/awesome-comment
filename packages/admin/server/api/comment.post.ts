import { ResponseBody } from '@awesome-comment/core/types';
import { getUser } from '~/utils/api';

export default defineEventHandler(async function (event): Promise<ResponseBody<string>> {
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

  const user = await getUser(authorization);
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
  } = user;
  const response = await fetch('https://api.awesome-comment.com/comment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: body.comment,
      postId: body.postId,
      user: {
        email,
        name: nickname || name,
        avatar: picture,
      },
    }),
  });

  if (!response.ok) {
    const { message } = await response.json();
    throw createError({
      statusCode: response.status,
      message,
    });
  }

  return {
    code: 0,
    data: 'ok',
  };
})
