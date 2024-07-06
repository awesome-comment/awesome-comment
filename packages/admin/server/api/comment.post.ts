import { ResponseBody, User } from '@awesome-comment/core/types';
import { CommentStatus } from '@awesome-comment/core/data';
import { getUser, getCacheKey, getConfig, checkCommentStatus, clearCache } from '~/server/utils';

type PostResponse = ResponseBody<{
  id: number,
  status: CommentStatus,
}>;

export default defineEventHandler(async function (event): Promise<PostResponse> {
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
    const message = (e as Error).message || e;
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
  let status: CommentStatus;

  // check if user is admin
  const config = await getConfig();
  if (config.adminEmails.includes(email)) {
    status = CommentStatus.Approved;
  } else {
    status = await checkCommentStatus(sub, body, config);
  }

  const ip = headers[ 'x-real-ip' ]
    || headers[ 'x-forwarded-for' ]
    || headers[ 'x-client-ip' ]
    || '';
  let id: number | null = null;
  const encodedCredentials = btoa(`${process.env.TIDB_PUBLIC_KEY}:${process.env.TIDB_PRIVATE_KEY}`);
  try {
    const url = process.env.TIDB_END_POINT + '/v1/post';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: body.comment,
        post_id: body.postId,
        ancestor_id: body.ancestorId || 0,
        parent_id: body.parentId || 0,
        user_id: sub,
        user: JSON.stringify({
          email,
          name: name || nickname,
          avatar: picture,
          ip,
          agent: headers['user-agent'],
          window: body.window || '',
        }),
        status,
      }),
    });
    const json = await response.json();
    id = Number(json.data.rows[ 0 ].last_insert_id);
  } catch (e) {
    const message = (e as Error).message || String(e);
    throw createError({
      statusCode: 400,
      message,
    });
  }

  // if admin reply, update parent_id to be approved
  if (config.adminEmails.includes(email) && body.parentId && body.status === CommentStatus.Pending) {
    const url = process.env.TIDB_END_POINT + '/v1/moderator/review';
    const kv = await getTidbKey();
    await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: CommentStatus.Approved,
        id: body.parentId,
      }),
    });
  }

  // if comment directly approved, clear cache
  if (status === CommentStatus.Approved) {
    const key = getCacheKey(body.postId);
    await clearCache(key);
  }

  return {
    code: 0,
    data: {
      id,
      status,
    },
  };
})
